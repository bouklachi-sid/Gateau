import { and, eq, gte, lte } from "drizzle-orm";
import { automationSettings, businesses, contentPosts, mediaAssets, offers, products, publicationLogs, publishingSlots } from "../drizzle/schema";
import { generateLocalizedCaption } from "./contentEngine";
import { getBusinessWorkspace, getDb } from "./db";
import { publishToFacebook } from "./meta";
import { effectiveDailyLimit } from "./publicationPolicy";
import { createDueSlotPublicationSpecs } from "./schedulePlanner";
import { visualPublicationBlockReason } from "../shared/visualCompliance";

function currentAlgeriaDayBounds() {
  const now = new Date();
  const local = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Algiers" }));
  const offset = local.getTime() - now.getTime();
  const startLocal = new Date(local);
  startLocal.setHours(0, 0, 0, 0);
  const endLocal = new Date(local);
  endLocal.setHours(23, 59, 59, 999);
  return { start: new Date(startLocal.getTime() - offset), end: new Date(endLocal.getTime() - offset) };
}

async function logEvent(input: { businessId: number; postId?: number | null; event: "prepared" | "queued" | "published" | "failed" | "paused" | "resumed" | "blocked"; message: string; metaResponse?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(publicationLogs).values(input);
}

async function createDueSlotPublications(businessId: number, now: Date) {
  const db = await getDb();
  if (!db) throw new Error("Base de données indisponible.");
  const slots = await db.select().from(publishingSlots).where(and(eq(publishingSlots.businessId, businessId), eq(publishingSlots.isActive, 1)));
  const activeProducts = await db.select().from(products).where(and(eq(products.businessId, businessId), eq(products.isActive, 1)));
  const activeOffers = await db.select().from(offers).where(and(eq(offers.businessId, businessId), eq(offers.isActive, 1)));
  const existing = await db.select({ scheduledFor: contentPosts.scheduledFor }).from(contentPosts).where(eq(contentPosts.businessId, businessId));
  const planned = createDueSlotPublicationSpecs({
    slots,
    existingScheduledFor: existing.flatMap(post => post.scheduledFor ? [post.scheduledFor] : []),
    products: activeProducts,
    offers: activeOffers,
    now,
  });

  for (const plan of planned) {
    const result = await db.insert(contentPosts).values({
      businessId,
      productId: plan.productId,
      offerId: plan.offerId,
      contentType: plan.contentType,
      format: plan.format,
      status: "scheduled",
      title: `${plan.slotLabel} — automatique`,
      scheduledFor: plan.scheduledFor,
      visualComplianceStatus: "pending_review",
    });
    const postId = Number(result[0].insertId);
    await logEvent({ businessId, postId, event: "queued", message: `Contenu créé automatiquement pour le créneau ${plan.slotLabel}.` });
  }

  if (planned.length) await db.update(automationSettings).set({ lastPreparedAt: now }).where(eq(automationSettings.businessId, businessId));
  return planned.length;
}

export async function runDuePublicationsForBusiness(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Base de données indisponible.");
  const workspace = await getBusinessWorkspaceByBusinessId(businessId);
  if (!workspace.settings?.isEnabled) return { ok: true, skipped: "automation-disabled", processed: 0 };
  const pageId = workspace.connection?.pageId;
  if (!pageId) {
    await logEvent({ businessId, event: "blocked", message: "Publication bloquée : l’identifiant de la Page Meta n’est pas configuré." });
    return { ok: true, skipped: "meta-page-missing", processed: 0 };
  }

  const now = new Date();
  await createDueSlotPublications(businessId, now);
  const { start, end } = currentAlgeriaDayBounds();
  const publishedToday = await db.select().from(contentPosts).where(and(
    eq(contentPosts.businessId, businessId),
    eq(contentPosts.status, "published"),
    gte(contentPosts.publishedAt, start),
    lte(contentPosts.publishedAt, end),
  ));
  const remaining = Math.max(0, effectiveDailyLimit(workspace.settings.maxPostsPerDay) - publishedToday.length);
  if (!remaining) return { ok: true, skipped: "daily-limit", processed: 0 };

  const duePosts = await db.select().from(contentPosts).where(and(
    eq(contentPosts.businessId, businessId),
    eq(contentPosts.status, "scheduled"),
    lte(contentPosts.scheduledFor, now),
  )).limit(remaining);

  let processed = 0;
  for (const post of duePosts) {
    try {
      const visualMedia = post.visualMediaAssetId
        ? (await db.select({ retouchStatus: mediaAssets.retouchStatus }).from(mediaAssets).where(and(eq(mediaAssets.id, post.visualMediaAssetId), eq(mediaAssets.businessId, businessId))).limit(1))[0]
        : undefined;
      const visualBlockReason = visualPublicationBlockReason({
        format: post.format,
        imageUrl: post.imageUrl,
        visualComplianceStatus: post.visualComplianceStatus,
        visualMediaAssetId: post.visualMediaAssetId,
        visualRetouched: post.visualRetouched === 1 && visualMedia?.retouchStatus === "retouched" ? 1 : 0,
        cakePreserved: post.cakePreserved,
        professionalStagingApproved: post.professionalStagingApproved,
        phoneNumberInImage: post.phoneNumberInImage,
        visualPhoneNumber: post.visualPhoneNumber,
        visualOrderCallout: post.visualOrderCallout,
        visualSceneDirection: post.visualSceneDirection,
        visualDecor: post.visualDecor,
        visualLighting: post.visualLighting,
        visualAngle: post.visualAngle,
        visualProps: post.visualProps,
        visualMood: post.visualMood,
      });
      if (visualBlockReason) {
        await db.update(contentPosts).set({ errorMessage: visualBlockReason, visualComplianceNote: visualBlockReason }).where(eq(contentPosts.id, post.id));
        if (post.visualComplianceNote !== visualBlockReason) {
          await logEvent({ businessId, postId: post.id, event: "blocked", message: visualBlockReason });
        }
        continue;
      }

      await db.update(contentPosts).set({ status: "publishing", errorMessage: null }).where(eq(contentPosts.id, post.id));
      const product = post.productId
        ? (await db.select().from(products).where(eq(products.id, post.productId)).limit(1))[0]
        : undefined;
      const offer = post.offerId
        ? (await db.select().from(offers).where(eq(offers.id, post.offerId)).limit(1))[0]
        : undefined;

      let caption = post.caption;
      let callToAction = post.callToAction;
      let hashtags = post.hashtags;
      let imagePrompt = post.imagePrompt;
      if (!caption) {
        const generated = await generateLocalizedCaption({
          business: workspace.business,
          contentType: post.contentType,
          product: product ? { name: product.name, description: product.description, priceDzd: product.priceDzd, category: product.category } : null,
          offer: offer ? { title: offer.title, description: offer.description, terms: offer.terms } : null,
        });
        caption = generated.caption;
        callToAction = generated.callToAction;
        hashtags = generated.hashtags;
        imagePrompt = generated.imagePrompt;
        await db.update(contentPosts).set({ title: generated.title, caption, callToAction, hashtags, imagePrompt }).where(eq(contentPosts.id, post.id));
        await logEvent({ businessId, postId: post.id, event: "prepared", message: "Légende localisée préparée automatiquement." });
      }

      const message = [caption, callToAction, hashtags].filter(Boolean).join("\n\n");
      const result = await publishToFacebook({ pageId, message, linkUrl: post.linkUrl, imageUrl: post.imageUrl });
      await db.update(contentPosts).set({ status: "published", publishedAt: new Date(), metaPostId: result.metaPostId, caption, callToAction, hashtags, errorMessage: null }).where(eq(contentPosts.id, post.id));
      await logEvent({ businessId, postId: post.id, event: "published", message: "Publication envoyée avec succès vers Facebook.", metaResponse: JSON.stringify(result) });
      processed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur inconnue lors de la publication.";
      await db.update(contentPosts).set({ status: "failed", errorMessage: message }).where(eq(contentPosts.id, post.id));
      await logEvent({ businessId, postId: post.id, event: "failed", message });
    }
  }
  return { ok: true, processed };
}

async function getBusinessWorkspaceByBusinessId(businessId: number) {
  const db = await getDb();
  if (!db) throw new Error("Base de données indisponible.");
  const business = (await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1))[0];
  if (!business) throw new Error("Pâtisserie introuvable.");
  const workspace = await getBusinessWorkspace(business.ownerId);
  return workspace;
}
