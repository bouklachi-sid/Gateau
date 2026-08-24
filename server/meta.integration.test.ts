import { describe, expect, it } from "vitest";
import { validateMetaPage, validateMetaToken } from "./meta";

describe("Meta Page access token", () => {
  it("is accepted by the lightweight Meta identity endpoint", async () => {
    const identity = await validateMetaToken();
    expect(identity.id).toBeTruthy();
  }, 20_000);

  it("can read the configured Facebook Page", async () => {
    const page = await validateMetaPage("1313747908483475");
    expect(page.id).toBe("1313747908483475");
    expect(page.name).toBeTruthy();
  }, 20_000);
});
