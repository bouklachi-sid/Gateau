import { retouchedMediaBlockReason } from "../shared/visualCompliance";

export type VisualMediaCandidate = {
  id: number;
  retouchStatus: "original" | "retouched";
};

export function requireCertifiedRetouchedMedia(media: VisualMediaCandidate): VisualMediaCandidate {
  const reason = retouchedMediaBlockReason(media.retouchStatus);
  if (reason) throw new Error(reason);
  return media;
}
