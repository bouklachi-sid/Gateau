import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../server/db";
import { publishingSlots } from "../drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("Base de données indisponible.");

  const slots = await db
    .select({
      timeOfDay: publishingSlots.timeOfDay,
      label: publishingSlots.label,
      preferredContentTypes: publishingSlots.preferredContentTypes,
    })
    .from(publishingSlots)
    .where(and(eq(publishingSlots.businessId, 1), eq(publishingSlots.isActive, 1)))
    .orderBy(asc(publishingSlots.timeOfDay));

  console.log(JSON.stringify({ activeSlotCount: slots.length, slots }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
