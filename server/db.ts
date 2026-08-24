import { and, desc, eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  automationSettings,
  businesses,
  contentPosts,
  deliveryZones,
  InsertUser,
  mediaAssets,
  metaConnections,
  offers,
  products,
  publicationLogs,
  publishingSlots,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId, lastSignedIn: new Date() };
  const updateSet: Record<string, unknown> = { lastSignedIn: new Date() };
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return (await db.select().from(users).where(eq(users.openId, openId)).limit(1))[0];
}

export async function getOrCreateBusiness(ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const existing = (await db.select().from(businesses).where(eq(businesses.ownerId, ownerId)).limit(1))[0];
  if (existing) return existing;

  const created = await db.insert(businesses).values({ ownerId, name: "Ma pâtisserie" });
  const businessId = Number(created[0].insertId);
  await Promise.all([
    db.insert(automationSettings).values({ businessId }),
    db.insert(metaConnections).values({ businessId }),
    db.insert(publishingSlots).values([
      { businessId, label: "Matin gourmand", timeOfDay: "09:30", daysOfWeek: [0, 1, 2, 3, 4, 5, 6], preferredContentTypes: ["traditionnel", "produit"] },
      { businessId, label: "Pause douceur", timeOfDay: "13:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6], preferredContentTypes: ["commercial", "offre"] },
      { businessId, label: "Soirée élégante", timeOfDay: "18:30", daysOfWeek: [0, 1, 2, 3, 4, 5, 6], preferredContentTypes: ["moderne", "engagement"] },
    ]),
  ]);
  return (await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1))[0]!;
}

export async function getBusinessWorkspace(ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const business = await getOrCreateBusiness(ownerId);
  const [settings] = await db.select().from(automationSettings).where(eq(automationSettings.businessId, business.id)).limit(1);
  const [connection] = await db.select().from(metaConnections).where(eq(metaConnections.businessId, business.id)).limit(1);
  return { business, settings, connection };
}

export async function getDashboardData(ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const { business, settings, connection } = await getBusinessWorkspace(ownerId);
  const [productsList, slots, upcoming, logs, zones, offersList] = await Promise.all([
    db.select().from(products).where(eq(products.businessId, business.id)).orderBy(desc(products.createdAt)),
    db.select().from(publishingSlots).where(and(eq(publishingSlots.businessId, business.id), eq(publishingSlots.isActive, 1))),
    db.select().from(contentPosts).where(and(eq(contentPosts.businessId, business.id), gte(contentPosts.scheduledFor, new Date()))).orderBy(contentPosts.scheduledFor).limit(8),
    db.select().from(publicationLogs).where(eq(publicationLogs.businessId, business.id)).orderBy(desc(publicationLogs.occurredAt)).limit(6),
    db.select().from(deliveryZones).where(eq(deliveryZones.businessId, business.id)),
    db.select().from(offers).where(eq(offers.businessId, business.id)).orderBy(desc(offers.createdAt)),
  ]);
  return { business, settings, connection, products: productsList, slots, upcoming, logs, zones, offers: offersList };
}

export async function getPostsForRange(ownerId: number, start: Date, end: Date) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const { business } = await getBusinessWorkspace(ownerId);
  return db.select().from(contentPosts).where(and(eq(contentPosts.businessId, business.id), gte(contentPosts.scheduledFor, start), lte(contentPosts.scheduledFor, end))).orderBy(contentPosts.scheduledFor);
}

export async function getMediaLibrary(ownerId: number) {
  const db = await getDb();
  if (!db) throw new Error("La base de données est indisponible.");
  const { business } = await getBusinessWorkspace(ownerId);
  return db.select().from(mediaAssets).where(eq(mediaAssets.businessId, business.id)).orderBy(desc(mediaAssets.createdAt)).limit(60);
}

export const tables = {
  automationSettings,
  businesses,
  contentPosts,
  deliveryZones,
  mediaAssets,
  metaConnections,
  offers,
  products,
  publicationLogs,
  publishingSlots,
};
