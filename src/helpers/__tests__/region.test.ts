import { getRegionNames, isCountryCode, sortRegions } from "@/lib/validators/region";
import { describe, expect, it } from "vitest";

describe("region helpers", () => {
  it("validates country codes", () => {
    expect(isCountryCode("US")).toBe(true);
    expect(isCountryCode("DE")).toBe(true);
    expect(isCountryCode("XX")).toBe(false);
  });

  it("returns localized region names map", () => {
    const english = getRegionNames("en");
    const german = getRegionNames("de");

    expect(english.US).toBe("United States");
    expect(german.DE).toBe("Deutschland");
  });

  it("sorts regions by localized names", () => {
    const sorted = sortRegions(["US", "DE", "FR"], "en");

    expect(sorted).toEqual(["FR", "DE", "US"]);
  });
});
