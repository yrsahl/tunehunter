import { isCountryCode, sortRegions } from "@/lib/validators/region";
import { describe, expect, it } from "vitest";

describe("region helpers", () => {
  it("validates country codes", () => {
    expect(isCountryCode("US")).toBe(true);
    expect(isCountryCode("DE")).toBe(true);
    expect(isCountryCode("XX")).toBe(false);
  });

  it("sorts regions by name", () => {
    const sorted = sortRegions(["US", "DE", "FR"]);

    expect(sorted).toEqual(["FR", "DE", "US"]);
  });
});
