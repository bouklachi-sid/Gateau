export const REQUIRED_IMAGE_PHONE_NUMBER = "0555188455";
export const REQUIRED_IMAGE_ORDER_CALLOUT = "للطلبات: 0555188455";

export const COMMERCIAL_SCENE_IDEAS = [
  "Marbre crème, ruban de soie et lumière du matin",
  "Plateau en laiton, fond beige chaud et ombres de fenêtre",
  "Table de fête ivoire, fleurs séchées et lumière éditoriale",
  "Velours bordeaux, vaisselle dorée et éclairage doux",
  "Lin naturel, panier tressé et soleil de fin d’après-midi",
  "Arche minimaliste sable, ombres graphiques et accessoires raffinés",
  "Nappe blanche plissée, perles discrètes et lumière latérale",
  "Boîte cadeau ouverte, ruban satin et décor de célébration",
  "Pierre claire, feuillage d’olivier et lumière méditerranéenne",
  "Table café élégante, porcelaine fine et ambiance accueillante",
] as const;

export type VisualPublicationInput = {
  format: "image" | "text" | "link";
  imageUrl?: string | null;
  visualComplianceStatus?: "pending_review" | "approved" | "rejected" | null;
  visualMediaAssetId?: number | null;
  visualRetouched?: number | boolean | null;
  cakePreserved?: number | boolean | null;
  professionalStagingApproved?: number | boolean | null;
  phoneNumberInImage?: number | boolean | null;
  visualPhoneNumber?: string | null;
  visualOrderCallout?: string | null;
  visualSceneDirection?: string | null;
  visualDecor?: string | null;
  visualLighting?: string | null;
  visualAngle?: string | null;
  visualProps?: string | null;
  visualMood?: string | null;
};

export function retouchedMediaBlockReason(retouchStatus: "original" | "retouched" | null | undefined): string | null {
  return retouchStatus === "retouched"
    ? null
    : "Ce média est déclaré original. Importez ou générez d’abord un visuel réellement retouché avant de l’associer.";
}

const checked = (value: number | boolean | null | undefined) => value === true || value === 1;

export function visualPublicationBlockReason(post: VisualPublicationInput): string | null {
  if (post.format !== "image") {
    return "Publication bloquée : chaque publication Facebook doit comporter un visuel commercial validé.";
  }
  if (!post.imageUrl) {
    return "Publication bloquée : ajoutez une photo retouchée avec une mise en scène commerciale avant validation.";
  }
  if (post.visualComplianceStatus !== "approved") {
    return "Publication bloquée : le visuel doit être validé manuellement avant envoi vers Facebook.";
  }
  if (!post.visualMediaAssetId || !checked(post.visualRetouched)) {
    return "Publication bloquée : associez un média réellement retouché et confirmez sa retouche avant validation.";
  }
  if (!checked(post.cakePreserved)) {
    return "Publication bloquée : confirmez que le gâteau original est strictement préservé.";
  }
  if (!checked(post.professionalStagingApproved)) {
    return "Publication bloquée : confirmez la mise en scène commerciale professionnelle.";
  }
  if (!checked(post.phoneNumberInImage) || post.visualPhoneNumber !== REQUIRED_IMAGE_PHONE_NUMBER) {
    return `Publication bloquée : le numéro exact ${REQUIRED_IMAGE_PHONE_NUMBER} doit être lisible dans l’image.`;
  }
  if (post.visualOrderCallout !== REQUIRED_IMAGE_ORDER_CALLOUT) {
    return `Publication bloquée : l’appel visible « ${REQUIRED_IMAGE_ORDER_CALLOUT} » doit préciser que ce numéro sert aux commandes.`;
  }
  if (!post.visualSceneDirection?.trim() || !post.visualDecor?.trim() || !post.visualLighting?.trim() || !post.visualAngle?.trim() || !post.visualProps?.trim() || !post.visualMood?.trim()) {
    return "Publication bloquée : renseignez un décor, un éclairage, un angle, des accessoires et une ambiance distincts pour ce visuel.";
  }
  return null;
}

export type ApprovedVisualIdentity = {
  id: number;
  visualMediaAssetId: number | null;
  decor: string | null;
  lighting: string | null;
  angle: string | null;
  props: string | null;
  mood: string | null;
};

export function visualReuseBlockReason(input: {
  postId: number;
  visualMediaAssetId: number;
  decor: string;
  lighting: string;
  angle: string;
  props: string;
  mood: string;
  approvedVisuals: ApprovedVisualIdentity[];
}): string | null {
  const normalize = (value: string) => value.trim().toLocaleLowerCase();
  if (input.approvedVisuals.some(visual => visual.id !== input.postId && visual.visualMediaAssetId === input.visualMediaAssetId)) {
    return "Ce même visuel est déjà approuvé pour une autre publication. Utilisez un rendu retouché différent.";
  }
  const fields = [
    ["decor", "décor"],
    ["lighting", "éclairage"],
    ["angle", "angle"],
    ["props", "accessoires"],
    ["mood", "ambiance"],
  ] as const;
  for (const [field, label] of fields) {
    const candidate = normalize(input[field]);
    if (input.approvedVisuals.some(visual => visual.id !== input.postId && visual[field] && normalize(visual[field]! as string) === candidate)) {
      return `Le ou la ${label} est déjà approuvé(e) pour une autre publication. Choisissez une variante distincte.`;
    }
  }
  return null;
}
