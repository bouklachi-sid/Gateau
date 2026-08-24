import { describe, expect, it } from "vitest";
import { requireCertifiedRetouchedMedia } from "./visualMediaCertification";

describe("certification serveur d’un média de publication", () => {
  it("refuse un asset original sur le chemin utilisé par la route d’association", () => {
    expect(() => requireCertifiedRetouchedMedia({ id: 10, retouchStatus: "original" })).toThrow("déclaré original");
  });

  it("accepte un asset dont la retouche est certifiée avant association", () => {
    expect(requireCertifiedRetouchedMedia({ id: 11, retouchStatus: "retouched" })).toEqual({ id: 11, retouchStatus: "retouched" });
  });
});
