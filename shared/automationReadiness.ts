import { visualPublicationBlockReason, type VisualPublicationInput } from "./visualCompliance";

export type AutomaticPublicationReadiness = {
  ready: boolean;
  label: "Prêt pour l’envoi automatique" | "À compléter avant envoi";
  reason: string | null;
};

/**
 * Transforme le contrôle de conformité qui protège le moteur de publication
 * en un état explicite pour le tableau de bord. Aucun élément de l’image n’est
 * évalué automatiquement : les confirmations manuelles restent obligatoires.
 */
export function getAutomaticPublicationReadiness(post: VisualPublicationInput): AutomaticPublicationReadiness {
  const reason = visualPublicationBlockReason(post);
  return reason
    ? { ready: false, label: "À compléter avant envoi", reason }
    : { ready: true, label: "Prêt pour l’envoi automatique", reason: null };
}
