import { describe, expect, it } from "vitest";

describe("Meta access token live validation", () => {
  it("authenticates against the Meta Graph API without exposing the token", async () => {
    const token = process.env.META_PAGE_ACCESS_TOKEN;
    expect(token).toBeTruthy();

    const response = await fetch(
      `https://graph.facebook.com/v26.0/me?fields=id&access_token=${encodeURIComponent(token!)}`,
    );
    expect(response.ok).toBe(true);

    const payload = (await response.json()) as { id?: string };
    expect(payload.id).toMatch(/^[0-9]+$/);
  }, 15_000);
});
