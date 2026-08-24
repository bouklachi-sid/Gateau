import { eq } from "drizzle-orm";
import { getDb } from "../server/db";
import { automationSettings, metaConnections } from "../drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Base de données indisponible.");

  const [settings] = await db
    .select({ isEnabled: automationSettings.isEnabled, maxPostsPerDay: automationSettings.maxPostsPerDay })
    .from(automationSettings)
    .where(eq(automationSettings.businessId, 1))
    .limit(1);
  const [connection] = await db
    .select({ pageName: metaConnections.pageName, status: metaConnections.status })
    .from(metaConnections)
    .where(eq(metaConnections.businessId, 1))
    .limit(1);

  console.log(JSON.stringify({
    pageName: connection?.pageName ?? null,
    connectionStatus: connection?.status ?? null,
    automationEnabled: settings?.isEnabled === 1,
    maxPostsPerDay: settings?.maxPostsPerDay ?? null,
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
