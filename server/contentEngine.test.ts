import { describe, expect, it } from "vitest";
import { buildScenePrompt } from "./contentEngine";

describe("buildScenePrompt", () => {
  it("verrouille explicitement l’intégrité du gâteau tout en demandant une mise en scène professionnelle", () => {
    const prompt = buildScenePrompt({ productName: "Makrout aux dattes", direction: "marbre clair et lumière douce" });
    expect(prompt).toContain("NON-NEGOTIABLE PRODUCT LOCK");
    expect(prompt).toContain("preserve the pastry exactly as supplied");
    expect(prompt).toContain("Only enhance the surrounding scene");
    expect(prompt).toContain("Makrout aux dattes");
  });
});

