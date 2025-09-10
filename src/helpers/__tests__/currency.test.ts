import { describe, expect, it } from "vitest";
import { currencySymbolMap } from "../currency";
import { transformCurrencyStringToIcon } from "../vendor-data/format-vendor-data";

describe("currency utilities", () => {
  describe("currencySymbolMap", () => {
    it("should contain major world currencies", () => {
      expect(currencySymbolMap.USD).toBe("$");
      expect(currencySymbolMap.EUR).toBe("€");
      expect(currencySymbolMap.GBP).toBe("£");
      expect(currencySymbolMap.JPY).toBe("¥");
    });

    it("should handle currencies with prefixes", () => {
      expect(currencySymbolMap.AUD).toBe("A$");
      expect(currencySymbolMap.CAD).toBe("C$");
      expect(currencySymbolMap.NZD).toBe("NZ$");
      expect(currencySymbolMap.HKD).toBe("HK$");
    });

    it("should include cryptocurrency-style symbols", () => {
      expect(currencySymbolMap.KRW).toBe("₩");
      expect(currencySymbolMap.INR).toBe("₹");
      expect(currencySymbolMap.TRY).toBe("₺");
      expect(currencySymbolMap.RUB).toBe("₽");
    });

    it("should include regional currencies", () => {
      expect(currencySymbolMap.SEK).toBe("kr");
      expect(currencySymbolMap.NOK).toBe("kr");
      expect(currencySymbolMap.DKK).toBe("kr");
      expect(currencySymbolMap.PLN).toBe("zł");
    });

    it("should be a complete record with string keys and values", () => {
      Object.entries(currencySymbolMap).forEach(([code, symbol]) => {
        expect(typeof code).toBe("string");
        expect(typeof symbol).toBe("string");
        expect(code.length).toBe(3); // ISO currency codes are 3 characters
        expect(symbol.length).toBeGreaterThan(0);
      });
    });
  });

  describe("transformCurrencyStringToIcon", () => {
    it("should return correct symbol for known currencies", () => {
      expect(transformCurrencyStringToIcon("USD")).toBe("$");
      expect(transformCurrencyStringToIcon("EUR")).toBe("€");
      expect(transformCurrencyStringToIcon("GBP")).toBe("£");
      expect(transformCurrencyStringToIcon("JPY")).toBe("¥");
    });

    it("should return original string for unknown currencies", () => {
      expect(transformCurrencyStringToIcon("XYZ")).toBe("XYZ");
      expect(transformCurrencyStringToIcon("UNKNOWN")).toBe("UNKNOWN");
      expect(transformCurrencyStringToIcon("ABC")).toBe("ABC");
    });

    it("should handle edge cases", () => {
      expect(transformCurrencyStringToIcon("")).toBe("");
      expect(transformCurrencyStringToIcon("   ")).toBe("   ");
    });

    it("should be case sensitive", () => {
      expect(transformCurrencyStringToIcon("usd")).toBe("usd"); // lowercase should return as-is
      expect(transformCurrencyStringToIcon("Usd")).toBe("Usd"); // mixed case should return as-is
    });

    it("should handle currencies with same symbols correctly", () => {
      // Multiple currencies use '$' symbol
      expect(transformCurrencyStringToIcon("USD")).toBe("$");
      expect(transformCurrencyStringToIcon("MXN")).toBe("$");
      expect(transformCurrencyStringToIcon("ARS")).toBe("$");

      // Multiple currencies use 'kr' symbol
      expect(transformCurrencyStringToIcon("SEK")).toBe("kr");
      expect(transformCurrencyStringToIcon("NOK")).toBe("kr");
      expect(transformCurrencyStringToIcon("DKK")).toBe("kr");
    });

    it("should handle special Unicode currency symbols", () => {
      expect(transformCurrencyStringToIcon("ILS")).toBe("₪");
      expect(transformCurrencyStringToIcon("AED")).toBe("د.إ");
      expect(transformCurrencyStringToIcon("VND")).toBe("₫");
      expect(transformCurrencyStringToIcon("THB")).toBe("฿");
    });
  });

  describe("currency symbol uniqueness", () => {
    it("should handle multiple currencies with same symbol", () => {
      const dollarCurrencies = Object.entries(currencySymbolMap)
        .filter(([_, symbol]) => symbol === "$")
        .map(([code]) => code);

      expect(dollarCurrencies).toContain("USD");
      expect(dollarCurrencies).toContain("MXN");
      expect(dollarCurrencies).toContain("ARS");
      expect(dollarCurrencies.length).toBeGreaterThan(1);
    });

    it("should have reasonable coverage of world currencies", () => {
      const currencyCount = Object.keys(currencySymbolMap).length;
      expect(currencyCount).toBeGreaterThan(30); // Should cover major world currencies
    });
  });
});
