import { describe, expect, it } from "vitest";
import { MAX_POSTS_PER_DAY, effectiveDailyLimit, hasDailyPublicationCapacity } from "./publicationPolicy";

describe("publication policy", () => {
  it("never permits more than ten scheduled publications in one day", () => {
    expect(MAX_POSTS_PER_DAY).toBe(10);
    expect(effectiveDailyLimit(25)).toBe(10);
    expect(hasDailyPublicationCapacity(9, 25)).toBe(true);
    expect(hasDailyPublicationCapacity(10, 25)).toBe(false);
  });

  it("respects a lower owner-configured limit", () => {
    expect(effectiveDailyLimit(3)).toBe(3);
    expect(hasDailyPublicationCapacity(3, 3)).toBe(false);
  });
});
