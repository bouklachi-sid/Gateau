import { describe, expect, it } from "vitest";
import { getAutomaticPublicationReadiness } from "../shared/automationReadiness";
import { REQUIRED_IMAGE_ORDER_CALLOUT, REQUIRED_IMAGE_PHONE_NUMBER } from "../shared/visualCompliance";

const compliantVisual = {
  format: "image" as const,
  imageUrl: "https://example.test/retouched-cake.jpg",
  visualComplianceStatus: "approved" as const,
  visualMediaAssetId: 41,
  visualRetouched: 1,
  cakePreserved: 1,
  professionalStagingApproved: 1,
  phoneNumberInImage: 1,
  visualPhoneNumber: REQUIRED_IMAGE_PHONE_NUMBER,
  visualOrderCallout: REQUIRED_IMAGE_ORDER_CALLOUT,
  visualSceneDirection: "Scène commerciale approuvée",
  visualDecor: "Table noyer et fond sable",
  visualLighting: "Lumière douce latérale",
  visualAngle: "Vue légèrement en plongée",
  visualProps: "Tasse dorée et branche d’olivier",
  visualMood: "Chaleureuse et élégante",
};

describe("getAutomaticPublicationReadiness", () => {
  it("déclare prêt uniquement un visuel qui passe tous les garde-fous", () => {
    expect(getAutomaticPublicationReadiness(compliantVisual)).toEqual({
      ready: true,
      label: "Prêt pour l’envoi automatique",
      reason: null,
    });
  });

  it("expose le même motif de blocage que le moteur pour un appel de commande absent", () => {
    const result = getAutomaticPublicationReadiness({ ...compliantVisual, visualOrderCallout: null });
    expect(result.ready).toBe(false);
    expect(result.label).toBe("À compléter avant envoi");
    expect(result.reason).toContain(REQUIRED_IMAGE_ORDER_CALLOUT);
  });
});
