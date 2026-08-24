export type AutomaticSlot = {
  label: string;
  timeOfDay: string;
  daysOfWeek: number[];
  preferredContentTypes: string[];
};

type ContentType = "commercial" | "saisonnier" | "traditionnel" | "produit" | "offre" | "engagement";

export type AutomaticContentSpec = {
  slotLabel: string;
  contentType: ContentType;
  format: "image" | "text";
  productId: number | null;
  offerId: number | null;
  scheduledFor: Date;
};

export function currentAlgeriaClock(now: Date) {
  const local = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Algiers" }));
  return {
    dayOfWeek: local.getDay(),
    minutes: local.getHours() * 60 + local.getMinutes(),
  };
}

export function slotIsDueForCreation(slot: AutomaticSlot, now: Date, windowMinutes = 5) {
  const { dayOfWeek, minutes } = currentAlgeriaClock(now);
  if (!slot.daysOfWeek.includes(dayOfWeek)) return false;
  const [hours, minutesPart] = slot.timeOfDay.split(":").map(Number);
  if (hours === undefined || minutesPart === undefined) return false;
  const slotMinutes = hours * 60 + minutesPart;
  return minutes >= slotMinutes && minutes < slotMinutes + windowMinutes;
}

export function algeriaSlotDate(now: Date, timeOfDay: string) {
  const localNow = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Algiers" }));
  const offset = localNow.getTime() - now.getTime();
  const [hours, minutes] = timeOfDay.split(":").map(Number);
  localNow.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return new Date(localNow.getTime() - offset);
}

export function createDueSlotPublicationSpecs(input: {
  slots: AutomaticSlot[];
  existingScheduledFor: Date[];
  products: Array<{ id: number }>;
  offers: Array<{ id: number }>;
  now: Date;
}) {
  const occupied = new Set(input.existingScheduledFor.map(date => date.getTime()));
  const plans: AutomaticContentSpec[] = [];

  for (const slot of input.slots) {
    if (!slotIsDueForCreation(slot, input.now)) continue;
    const scheduledFor = algeriaSlotDate(input.now, slot.timeOfDay);
    if (occupied.has(scheduledFor.getTime())) continue;
    const contentType = (slot.preferredContentTypes[0] ?? "commercial") as ContentType;
    const product = input.products.length && ["traditionnel", "produit", "commercial"].includes(contentType)
      ? input.products[scheduledFor.getUTCHours() % input.products.length]
      : undefined;
    const offer = contentType === "offre" ? input.offers[0] : undefined;
    const format: "image" | "text" = ["traditionnel", "produit", "commercial"].includes(contentType) ? "image" : "text";
    plans.push({ slotLabel: slot.label, contentType, format, productId: product?.id ?? null, offerId: offer?.id ?? null, scheduledFor });
    occupied.add(scheduledFor.getTime());
  }

  return plans;
}
