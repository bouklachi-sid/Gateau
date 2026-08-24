import { afterEach, describe, expect, it, vi } from "vitest";
import { publishToFacebook } from "./meta";

describe("Meta Page token resolution", () => {
  const previousToken = process.env.META_PAGE_ACCESS_TOKEN;

  afterEach(() => {
    process.env.META_PAGE_ACCESS_TOKEN = previousToken;
    vi.unstubAllGlobals();
  });

  it("uses the Page access token derived from a configured user token for a photo post", async () => {
    process.env.META_PAGE_ACCESS_TOKEN = "user-token";
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "user-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ id: "page-1", access_token: "page-token" }] }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ post_id: "page-1_42" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await publishToFacebook({
      pageId: "page-1",
      message: "Essai",
      imageUrl: "https://example.com/photo.jpg",
    });

    expect(result.metaPostId).toBe("page-1_42");
    expect(String(fetchMock.mock.calls[2][0])).toContain("/page-1/photos");
    expect(String(fetchMock.mock.calls[2][1].body)).toContain("access_token=page-token");
  });
});

