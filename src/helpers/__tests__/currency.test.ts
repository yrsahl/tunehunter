import { currencySymbolMap } from "@/lib/formatters/currency";
import { describe, expect, it } from "vitest";

describe("currencySymbolMap", () => {
  it("contains common currency symbols", () => {
    expect(currencySymbolMap.USD).toBe("$");
    expect(currencySymbolMap.EUR).toBe("€");
    expect(currencySymbolMap.GBP).toBe("£");
  });

  it("contains a broad set of currencies", () => {
    expect(Object.keys(currencySymbolMap).length).toBeGreaterThan(20);
    expect(currencySymbolMap.JPY).toBe("¥");
    expect(currencySymbolMap.CHF).toBe("CHF");
  });
});
