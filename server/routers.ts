import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { and, eq, sql } from "drizzle-orm";
import { parse as parseCookie } from "cookie";
import { z } from "zod";
import { createHeartbeatJob, updateHeartbeatJob } from "./_core/heartbeat";
import { generateImage } from "./_core/imageGeneration";
import { generateLocalizedCaption, buildScenePrompt } from "./contentEngine";
import { getBusinessWorkspace, getDashboardData, getDb, getMediaLibrary, getPostsForRange, tables } from "./db";
import { metaTokenIsConfigured, validateMetaPage } from "./meta";
import { storagePut } from "./storage";
import { hasDailyPublicationCapacity } from "./publicationPolicy";

const contentTypeSchema = z.enum(["commercial", "saisonnier", "traditionnel", "produit", "offre", "engagement"]);
const postFormatSchema = z.enum(["text", "link", "image"]);

function getUserSession(ctx: { req: { headers: { cookie?: string } } }) {
  return parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
}

function validatedSchedule(cron: string) {
  if (!/^0 \*\/5 \* \* \* \*$/.test(cron)) throw new Error("La fréquence de vérification doit rester fixée à cinq minutes pour protéger la Page.");
  return cron;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  workspace: router({
    dashboard: protectedProcedure.query(({ ctx }) => getDashboardData(ctx.user.id)),
    saveBusiness: protectedProcedure.input(z.object({
      name: z.string().trim().min(2).max(160),
      tagline: z.string().trim().max(220).nullable(),
      brandStory: z.string().trim().max(2000).nullable(),
      primaryLanguage: z.enum(["fr", "ar", "darija", "mixed"]),
      tone: z.string().trim().min(3).max(160),
      phone: z.string().trim().max(40).nullable(),
      whatsapp: z.string().trim().max(40).nullable(),
      orderUrl: z.string().url().nullable().or(z.literal("")),
      orderInstructions: z.string().trim().max(500).nullable(),
      accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business } = await getBusinessWorkspace(ctx.user.id);
      await db.update(tables.businesses).set({ ...input, primaryLanguage: "ar", orderUrl: input.orderUrl || null }).where(eq(tables.businesses.id, business.id));
      return { success: true };
    }),
    products: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business } = await getBusinessWorkspace(ctx.user.id);
      return db.select().from(tables.products).where(eq(tables.products.businessId, business.id));
    }),
    createProduct: protectedProcedure.input(z.object({
      name: z.string().trim().min(2).max(160),
      category: z.enum(["traditionnel", "moderne", "événement", "coffret", "autre"]),
      description: z.string().trim().max(1000).nullable(),
      priceDzd: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable(),
      visualPrompt: z.string().trim().max(700).nullable(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business } = await getBusinessWorkspace(ctx.user.id);
      const result = await db.insert(tables.products).values({ ...input, businessId: business.id });
      return { id: Number(result[0].insertId) };
    }),
    uploadProductPhoto: protectedProcedure.input(z.object({
      productId: z.number().int().positive(),
      fileName: z.string().trim().min(1).max(140),
      dataUrl: z.string().min(30),
    })).mutation(async ({ ctx, input }) => {
      const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) throw new Error("Format d’image non pris en charge. Utilisez JPEG, PNG ou WebP.");
      const mimeType = match[1]!;
      const encoded = match[2]!;
      const buffer = Buffer.from(encoded, "base64");
      if (buffer.byteLength > 10 * 1024 * 1024) throw new Error("La photo ne doit pas dépasser 10 Mo.");
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business } = await getBusinessWorkspace(ctx.user.id);
      const product = (await db.select().from(tables.products).where(and(eq(tables.products.id, input.productId), eq(tables.products.businessId, business.id))).limit(1))[0];
      if (!product) throw new Error("Produit introuvable.");
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      const stored = await storagePut(`business-${business.id}/products/${safeName}`, buffer, mimeType);
      await db.update(tables.products).set({ photoUrl: stored.url }).where(eq(tables.products.id, product.id));
      await db.insert(tables.mediaAssets).values({ businessId: business.id, productId: product.id, kind: "product", source: "upload", url: stored.url, altText: product.name });
      return { url: stored.url };
    }),
    createProductScene: protectedProcedure.input(z.object({ productId: z.number().int().positive(), direction: z.string().trim().max(700).nullable() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business } = await getBusinessWorkspace(ctx.user.id);
      const product = (await db.select().from(tables.products).where(and(eq(tables.products.id, input.productId), eq(tables.products.businessId, business.id))).limit(1))[0];
      if (!product?.photoUrl) throw new Error("Ajoutez d’abord la photo originale du gâteau.");
      const prompt = buildScenePrompt({ productName: product.name, productDescription: product.description, direction: input.direction ?? product.visualPrompt });
      const result = await generateImage({ prompt, originalImages: [{ url: product.photoUrl, mimeType: "image/jpeg" }] });
      if (!result.url) throw new Error("La mise en scène n’a produit aucune image exploitable.");
      const generatedUrl = result.url;
      await db.insert(tables.mediaAssets).values({ businessId: business.id, productId: product.id, kind: "product", source: "generated", url: generatedUrl, prompt, altText: `Mise en scène de ${product.name}` });
      return { url: generatedUrl, prompt };
    }),
    createSlot: protectedProcedure.input(z.object({
      label: z.string().trim().min(2).max(100),
      timeOfDay: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1),
      preferredContentTypes: z.array(contentTypeSchema).min(1),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business } = await getBusinessWorkspace(ctx.user.id);
      const existing = await db.select().from(tables.publishingSlots).where(and(eq(tables.publishingSlots.businessId, business.id), eq(tables.publishingSlots.isActive, 1)));
      if (existing.length >= 10) throw new Error("La plateforme limite les créneaux actifs à dix par jour.");
      await db.insert(tables.publishingSlots).values({ ...input, businessId: business.id, daysOfWeek: Array.from(new Set(input.daysOfWeek)), preferredContentTypes: input.preferredContentTypes });
      return { success: true };
    }),
    createDeliveryZone: protectedProcedure.input(z.object({
      name: z.string().trim().min(2).max(140),
      deliveryFeeDzd: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable(),
      minimumOrderDzd: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable(),
      note: z.string().trim().max(240).nullable(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business } = await getBusinessWorkspace(ctx.user.id);
      await db.insert(tables.deliveryZones).values({ ...input, businessId: business.id });
      return { success: true };
    }),
    createOffer: protectedProcedure.input(z.object({
      title: z.string().trim().min(2).max(180),
      description: z.string().trim().max(1200).nullable(),
      terms: z.string().trim().max(800).nullable(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business } = await getBusinessWorkspace(ctx.user.id);
      await db.insert(tables.offers).values({ ...input, businessId: business.id });
      return { success: true };
    }),
    posts: protectedProcedure.input(z.object({ start: z.date(), end: z.date() })).query(({ ctx, input }) => getPostsForRange(ctx.user.id, input.start, input.end)),
    media: protectedProcedure.query(({ ctx }) => getMediaLibrary(ctx.user.id)),
    createPost: protectedProcedure.input(z.object({
      contentType: contentTypeSchema,
      format: postFormatSchema,
      productId: z.number().int().positive().nullable(),
      title: z.string().trim().max(180).nullable(),
      scheduledFor: z.date(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business, settings } = await getBusinessWorkspace(ctx.user.id);
      const existing = await db.select({ count: sql<number>`count(*)` }).from(tables.contentPosts).where(and(eq(tables.contentPosts.businessId, business.id), sql`DATE(${tables.contentPosts.scheduledFor}) = DATE(${input.scheduledFor})`, eq(tables.contentPosts.status, "scheduled")));
      const dailyLimit = settings?.maxPostsPerDay ?? 10;
      if (!hasDailyPublicationCapacity(Number(existing[0]?.count ?? 0), dailyLimit)) throw new Error(`La limite de ${dailyLimit} publications prévues pour cette journée est atteinte.`);
      const result = await db.insert(tables.contentPosts).values({ ...input, businessId: business.id, status: "scheduled" });
      return { id: Number(result[0].insertId) };
    }),
    generateCaption: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business } = await getBusinessWorkspace(ctx.user.id);
      const post = (await db.select().from(tables.contentPosts).where(and(eq(tables.contentPosts.id, input.postId), eq(tables.contentPosts.businessId, business.id))).limit(1))[0];
      if (!post) throw new Error("Publication introuvable.");
      const product = post.productId ? (await db.select().from(tables.products).where(eq(tables.products.id, post.productId)).limit(1))[0] : null;
      const generated = await generateLocalizedCaption({ business, contentType: post.contentType, product: product ? { name: product.name, description: product.description, priceDzd: product.priceDzd, category: product.category } : null });
      await db.update(tables.contentPosts).set(generated).where(eq(tables.contentPosts.id, post.id));
      return generated;
    }),
    saveMetaPage: protectedProcedure.input(z.object({ pageId: z.string().trim().min(3).max(80), pageName: z.string().trim().max(180).nullable() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business } = await getBusinessWorkspace(ctx.user.id);
      await db.update(tables.metaConnections).set({ pageId: input.pageId, pageName: input.pageName, status: "disconnected", lastError: null }).where(eq(tables.metaConnections.businessId, business.id));
      return { success: true };
    }),
    validateMeta: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business, connection } = await getBusinessWorkspace(ctx.user.id);
      if (!connection?.pageId) throw new Error("Saisissez d’abord l’identifiant de la Page Facebook.");
      try {
        const page = await validateMetaPage(connection.pageId);
        await db.update(tables.metaConnections).set({ pageId: page.id, pageName: page.name, status: "connected", lastValidatedAt: new Date(), lastError: null }).where(eq(tables.metaConnections.businessId, business.id));
        return { connected: true, page };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Connexion Meta impossible.";
        await db.update(tables.metaConnections).set({ status: "error", lastError: message }).where(eq(tables.metaConnections.businessId, business.id));
        throw error;
      }
    }),
    automation: protectedProcedure.input(z.object({ enabled: z.boolean() })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Base de données indisponible.");
      const { business, settings, connection } = await getBusinessWorkspace(ctx.user.id);
      if (input.enabled && !connection?.pageId) throw new Error("Configurez d’abord la Page Meta à utiliser.");
      let taskUid = settings?.scheduleCronTaskUid ?? null;
      const session = getUserSession(ctx);
      if (input.enabled && !taskUid) {
        const job = await createHeartbeatJob({
          name: `facebook-patisserie-${business.id}`,
          cron: validatedSchedule("0 */5 * * * *"),
          path: "/api/scheduled/publish-due-content",
          payload: { businessId: business.id },
          description: `Vérifie et publie les contenus Facebook programmés de ${business.name}.`,
        }, session);
        taskUid = job.taskUid;
      } else if (taskUid) {
        await updateHeartbeatJob(taskUid, { enable: input.enabled }, session);
      }
      await db.update(tables.automationSettings).set({ isEnabled: input.enabled ? 1 : 0, scheduleCronTaskUid: taskUid, stoppedAt: input.enabled ? null : new Date() }).where(eq(tables.automationSettings.businessId, business.id));
      await db.insert(tables.publicationLogs).values({ businessId: business.id, event: input.enabled ? "resumed" : "paused", message: input.enabled ? "Automatisation activée." : "Automatisation interrompue immédiatement." });
      return { enabled: input.enabled, taskUid };
    }),
    metaStatus: protectedProcedure.query(() => ({ tokenConfigured: metaTokenIsConfigured() })),
  }),
});

export type AppRouter = typeof appRouter;
