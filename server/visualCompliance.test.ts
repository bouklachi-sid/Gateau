import { describe, expect, it } from "vitest";
import { REQUIRED_IMAGE_ORDER_CALLOUT, REQUIRED_IMAGE_PHONE_NUMBER, retouchedMediaBlockReason, visualPublicationBlockReason, visualReuseBlockReason } from "../shared/visualCompliance";

const compliantImage = {
  format: "image" as const,
  imageUrl: "/manus-storage/visual-commercial.jpg",
  visualComplianceStatus: "approved" as const,
  visualMediaAssetId: 41,
  visualRetouched: 1,
  cakePreserved: 1,
  professionalStagingApproved: 1,
  phoneNumberInImage: 1,
  visualPhoneNumber: REQUIRED_IMAGE_PHONE_NUMBER,
  visualOrderCallout: REQUIRED_IMAGE_ORDER_CALLOUT,
  visualSceneDirection: "Table de fête ivoire, fleurs séchées et lumière éditoriale",
  visualDecor: "table de fête ivoire",
  visualLighting: "lumière éditoriale latérale",
  visualAngle: "vue trois-quarts",
  visualProps: "fleurs séchées et plateau doré",
  visualMood: "réception élégante",
};

describe("conformité visuelle avant publication Facebook", () => {
  it("bloque un visuel en attente de revue même s’il possède une image", () => {
    expect(visualPublicationBlockReason({ ...compliantImage, visualComplianceStatus: "pending_review" })).toContain("validé manuellement");
  });

  it("bloque un visuel dont le numéro exact n’est pas confirmé dans l’image", () => {
    expect(visualPublicationBlockReason({ ...compliantImage, phoneNumberInImage: 0, visualPhoneNumber: null })).toContain(REQUIRED_IMAGE_PHONE_NUMBER);
  });

  it("bloque un visuel si le contact visible ne précise pas qu’il sert aux commandes", () => {
    expect(visualPublicationBlockReason({ ...compliantImage, visualOrderCallout: REQUIRED_IMAGE_PHONE_NUMBER })).toContain("sert aux commandes");
  });

  it("bloque une photo même approuvée si aucun média retouché n’est associé", () => {
    expect(visualPublicationBlockReason({ ...compliantImage, visualMediaAssetId: null, visualRetouched: 0 })).toContain("réellement retouché");
  });

  it("refuse explicitement un média original même si un client tente de l’associer", () => {
    expect(retouchedMediaBlockReason("original")).toContain("déclaré original");
    expect(retouchedMediaBlockReason("retouched")).toBeNull();
  });

  it("bloque une mise en scène si une de ses composantes de diversité manque", () => {
    expect(visualPublicationBlockReason({ ...compliantImage, visualMood: null })).toContain("décor, un éclairage, un angle, des accessoires et une ambiance");
  });

  it("refuse la réutilisation d’un même rendu retouché", () => {
    expect(visualReuseBlockReason({
      postId: 2,
      visualMediaAssetId: 41,
      decor: compliantImage.visualDecor,
      lighting: compliantImage.visualLighting,
      angle: compliantImage.visualAngle,
      props: compliantImage.visualProps,
      mood: compliantImage.visualMood,
      approvedVisuals: [{ id: 1, visualMediaAssetId: 41, decor: "autre", lighting: "autre", angle: "autre", props: "autre", mood: "autre" }],
    })).toContain("même visuel");
  });

  it("refuse la réutilisation d’une composante de scène même si le média change", () => {
    expect(visualReuseBlockReason({
      postId: 2,
      visualMediaAssetId: 42,
      decor: compliantImage.visualDecor,
      lighting: compliantImage.visualLighting,
      angle: compliantImage.visualAngle,
      props: compliantImage.visualProps,
      mood: compliantImage.visualMood,
      approvedVisuals: [{ id: 1, visualMediaAssetId: 41, decor: compliantImage.visualDecor, lighting: "autre", angle: "autre", props: "autre", mood: "autre" }],
    })).toContain("décor");
  });

  it("autorise seulement une image approuvée avec gâteau préservé, scène commerciale et numéro exact", () => {
    expect(visualPublicationBlockReason(compliantImage)).toBeNull();
  });

  it("bloque les publications qui ne sont pas des images", () => {
    expect(visualPublicationBlockReason({ ...compliantImage, format: "text" })).toContain("visuel commercial validé");
  });
});
