import {
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const businesses = mysqlTable(
  "businesses",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    tagline: varchar("tagline", { length: 220 }),
    brandStory: text("brandStory"),
    market: varchar("market", { length: 80 }).default("Algérie").notNull(),
    primaryLanguage: mysqlEnum("primaryLanguage", ["fr", "ar", "darija", "mixed"]).default("mixed").notNull(),
    tone: varchar("tone", { length: 160 }).default("Élégant, chaleureux et gourmand").notNull(),
    accentColor: varchar("accentColor", { length: 12 }).default("#BC6C3B").notNull(),
    logoUrl: text("logoUrl"),
    phone: varchar("phone", { length: 40 }),
    whatsapp: varchar("whatsapp", { length: 40 }),
    orderUrl: text("orderUrl"),
    orderInstructions: text("orderInstructions"),
    timezone: varchar("timezone", { length: 64 }).default("Africa/Algiers").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("businesses_owner_unique").on(table.ownerId)]
);

export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    category: mysqlEnum("category", ["traditionnel", "moderne", "événement", "coffret", "autre"]).default("autre").notNull(),
    description: text("description"),
    priceDzd: decimal("priceDzd", { precision: 12, scale: 2 }),
    photoUrl: text("photoUrl"),
    visualPrompt: text("visualPrompt"),
    isActive: int("isActive").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("products_business_idx").on(table.businessId)]
);

export const deliveryZones = mysqlTable(
  "delivery_zones",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 140 }).notNull(),
    deliveryFeeDzd: decimal("deliveryFeeDzd", { precision: 12, scale: 2 }),
    minimumOrderDzd: decimal("minimumOrderDzd", { precision: 12, scale: 2 }),
    note: varchar("note", { length: 240 }),
    isActive: int("isActive").default(1).notNull(),
  },
  table => [index("delivery_zones_business_idx").on(table.businessId)]
);

export const offers = mysqlTable(
  "offers",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    description: text("description"),
    terms: text("terms"),
    startsAt: timestamp("startsAt"),
    endsAt: timestamp("endsAt"),
    isActive: int("isActive").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("offers_business_idx").on(table.businessId)]
);

export const publishingSlots = mysqlTable(
  "publishing_slots",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 100 }).notNull(),
    timeOfDay: varchar("timeOfDay", { length: 5 }).notNull(),
    daysOfWeek: json("daysOfWeek").$type<number[]>().notNull(),
    preferredContentTypes: json("preferredContentTypes").$type<string[]>().notNull(),
    isActive: int("isActive").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [index("publishing_slots_business_idx").on(table.businessId)]
);

export const automationSettings = mysqlTable(
  "automation_settings",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    isEnabled: int("isEnabled").default(0).notNull(),
    maxPostsPerDay: int("maxPostsPerDay").default(10).notNull(),
    scheduleCronTaskUid: varchar("scheduleCronTaskUid", { length: 65 }),
    lastPreparedAt: timestamp("lastPreparedAt"),
    lastPublishedAt: timestamp("lastPublishedAt"),
    stoppedAt: timestamp("stoppedAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("automation_settings_business_unique").on(table.businessId),
    index("automation_settings_task_uid_idx").on(table.scheduleCronTaskUid),
  ]
);

export const metaConnections = mysqlTable(
  "meta_connections",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    pageId: varchar("pageId", { length: 80 }),
    pageName: varchar("pageName", { length: 180 }),
    status: mysqlEnum("status", ["disconnected", "connected", "needs_reauth", "error"]).default("disconnected").notNull(),
    lastValidatedAt: timestamp("lastValidatedAt"),
    lastError: text("lastError"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [uniqueIndex("meta_connections_business_unique").on(table.businessId)]
);

export const contentPosts = mysqlTable(
  "content_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    productId: int("productId").references(() => products.id, { onDelete: "set null" }),
    offerId: int("offerId").references(() => offers.id, { onDelete: "set null" }),
    contentType: mysqlEnum("contentType", ["commercial", "saisonnier", "traditionnel", "produit", "offre", "engagement"]).notNull(),
    format: mysqlEnum("format", ["text", "link", "image"]).default("text").notNull(),
    status: mysqlEnum("status", ["draft", "scheduled", "publishing", "published", "failed", "cancelled"]).default("draft").notNull(),
    title: varchar("title", { length: 180 }),
    caption: text("caption"),
    callToAction: varchar("callToAction", { length: 220 }),
    hashtags: text("hashtags"),
    linkUrl: text("linkUrl"),
    imageUrl: text("imageUrl"),
    imagePrompt: text("imagePrompt"),
    scheduledFor: timestamp("scheduledFor"),
    publishedAt: timestamp("publishedAt"),
    metaPostId: varchar("metaPostId", { length: 120 }),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    index("content_posts_business_status_idx").on(table.businessId, table.status),
    index("content_posts_scheduled_idx").on(table.scheduledFor),
  ]
);

export const mediaAssets = mysqlTable(
  "media_assets",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    postId: int("postId").references(() => contentPosts.id, { onDelete: "set null" }),
    productId: int("productId").references(() => products.id, { onDelete: "set null" }),
    kind: mysqlEnum("kind", ["product", "promotion", "brand"]).notNull(),
    source: mysqlEnum("source", ["upload", "generated"]).notNull(),
    url: text("url").notNull(),
    prompt: text("prompt"),
    altText: varchar("altText", { length: 280 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [index("media_assets_business_idx").on(table.businessId)]
);

export const publicationLogs = mysqlTable(
  "publication_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    businessId: int("businessId").notNull().references(() => businesses.id, { onDelete: "cascade" }),
    postId: int("postId").references(() => contentPosts.id, { onDelete: "set null" }),
    event: mysqlEnum("event", ["prepared", "queued", "published", "failed", "paused", "resumed", "blocked"]).notNull(),
    message: text("message").notNull(),
    metaResponse: text("metaResponse"),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
  },
  table => [
    index("publication_logs_business_occurred_idx").on(table.businessId, table.occurredAt),
    index("publication_logs_post_idx").on(table.postId),
  ]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Business = typeof businesses.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ContentPost = typeof contentPosts.$inferSelect;
