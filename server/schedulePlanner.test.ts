import { describe, expect, it } from "vitest";
import { algeriaSlotDate, createDueSlotPublicationSpecs, slotIsDueForCreation } from "./schedulePlanner";

describe("planification automatique des créneaux", () => {
  const everyDayMorning = { label: "Matin traditionnel", timeOfDay: "09:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6], preferredContentTypes: ["traditionnel"] };

  it("déclenche un créneau seulement dans la fenêtre de cinq minutes prévue", () => {
    expect(slotIsDueForCreation(everyDayMorning, new Date("2026-08-24T08:02:00.000Z"))).toBe(true);
    expect(slotIsDueForCreation(everyDayMorning, new Date("2026-08-24T08:05:00.000Z"))).toBe(false);
  });

  it("convertit un créneau Algérie en date UTC stable", () => {
    expect(algeriaSlotDate(new Date("2026-08-24T08:02:00.000Z"), "20:30").toISOString()).toBe("2026-08-24T19:30:00.000Z");
  });

  it("crée une seule publication pour un créneau dû et ne la duplique pas", () => {
    const now = new Date("2026-08-24T08:02:00.000Z");
    const first = createDueSlotPublicationSpecs({ slots: [everyDayMorning], existingScheduledFor: [], products: [{ id: 12 }], offers: [], now });
    const second = createDueSlotPublicationSpecs({ slots: [everyDayMorning], existingScheduledFor: first.map(item => item.scheduledFor), products: [{ id: 12 }], offers: [], now });
    expect(first).toMatchObject([{ contentType: "traditionnel", format: "image", productId: 12, offerId: null }]);
    expect(second).toEqual([]);
  });

  it("sélectionne une offre pour le créneau promotionnel", () => {
    const offerSlot = { ...everyDayMorning, label: "Offre de midi", timeOfDay: "11:30", preferredContentTypes: ["offre"] };
    const plans = createDueSlotPublicationSpecs({ slots: [offerSlot], existingScheduledFor: [], products: [{ id: 12 }], offers: [{ id: 7 }], now: new Date("2026-08-24T10:31:00.000Z") });
    expect(plans).toMatchObject([{ contentType: "offre", format: "image", productId: null, offerId: 7 }]);
  });
});
