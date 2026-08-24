import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { automationSettings } from "../drizzle/schema";
import { getDb } from "./db";
import { sdk } from "./_core/sdk";
import { runDuePublicationsForBusiness } from "./publicationRunner";

export async function publishDueContentHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "database-unavailable" });
    const setting = (await db.select().from(automationSettings).where(eq(automationSettings.scheduleCronTaskUid, user.taskUid)).limit(1))[0];
    if (!setting) return res.json({ ok: true, skipped: "orphan" });
    const result = await runDuePublicationsForBusiness(setting.businessId);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return res.status(500).json({ error: message, timestamp: new Date().toISOString(), context: { url: req.originalUrl } });
  }
}
