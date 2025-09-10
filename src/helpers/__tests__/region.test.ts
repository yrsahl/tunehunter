import { describe, expect, it } from "vitest";
import {
  CountryCodes,
  countryNamesEnglish,
  countryNamesGerman,
  countryNamesSpanish,
  getRegionNames,
  isCountryCode,
  sortRegions,
  type CountryCode,
} from "../region";

describe("region utilities", () => {
  describe("CountryCodes array", () => {
    it("should contain valid ISO 3166-1 alpha-2 codes", () => {
      expect(CountryCodes).toContain("US");
      expect(CountryCodes).toContain("DE");
      expect(CountryCodes).toContain("GB");
      expect(CountryCodes).toContain("FR");
      expect(CountryCodes).toContain("JP");
    });

    it("should have codes in uppercase format", () => {
      CountryCodes.forEach((code) => {
        expect(code).toMatch(/^[A-Z]{2}$/);
        expect(code).toBe(code.toUpperCase());
      });
    });

    it("should have reasonable number of countries", () => {
      expect(CountryCodes.length).toBeGreaterThan(190); // There are ~195 countries
      expect(CountryCodes.length).toBeLessThan(300); // Reasonable upper bound
    });

    it("should not have duplicates", () => {
      const uniqueCodes = new Set(CountryCodes);
      expect(uniqueCodes.size).toBe(CountryCodes.length);
    });
  });

  describe("isCountryCode function", () => {
    it("should return true for valid country codes", () => {
      expect(isCountryCode("US")).toBe(true);
      expect(isCountryCode("DE")).toBe(true);
      expect(isCountryCode("GB")).toBe(true);
      expect(isCountryCode("FR")).toBe(true);
    });

    it("should return false for invalid country codes", () => {
      expect(isCountryCode("XX")).toBe(false);
      expect(isCountryCode("ZZ")).toBe(false);
      expect(isCountryCode("ABC")).toBe(false);
      expect(isCountryCode("123")).toBe(false);
    });

    it("should return false for lowercase codes", () => {
      expect(isCountryCode("us")).toBe(false);
      expect(isCountryCode("de")).toBe(false);
      expect(isCountryCode("gb")).toBe(false);
    });

    it("should return false for empty or invalid inputs", () => {
      expect(isCountryCode("")).toBe(false);
      expect(isCountryCode(" ")).toBe(false);
      expect(isCountryCode("U")).toBe(false);
      expect(isCountryCode("USA")).toBe(false);
    });

    it("should work as a type guard", () => {
      const input: string = "US";
      if (isCountryCode(input)) {
        // TypeScript should know input is CountryCode here
        const countryName: string = countryNamesEnglish[input];
        expect(countryName).toBe("United States");
      }
    });
  });

  describe("country name dictionaries", () => {
    describe("countryNamesEnglish", () => {
      it("should have entries for major countries", () => {
        expect(countryNamesEnglish.US).toBe("United States");
        expect(countryNamesEnglish.DE).toBe("Germany");
        expect(countryNamesEnglish.GB).toBe("United Kingdom");
        expect(countryNamesEnglish.FR).toBe("France");
        expect(countryNamesEnglish.JP).toBe("Japan");
      });

      it("should have an entry for every country code", () => {
        CountryCodes.forEach((code) => {
          expect(countryNamesEnglish[code as CountryCode]).toBeDefined();
          expect(typeof countryNamesEnglish[code as CountryCode]).toBe("string");
          expect(countryNamesEnglish[code as CountryCode].length).toBeGreaterThan(0);
        });
      });
    });

    describe("countryNamesGerman", () => {
      it("should have German translations for major countries", () => {
        expect(countryNamesGerman.US).toBe("Vereinigte Staaten");
        expect(countryNamesGerman.DE).toBe("Deutschland");
        expect(countryNamesGerman.GB).toBe("Vereinigtes Königreich");
        expect(countryNamesGerman.FR).toBe("Frankreich");
      });

      it("should have an entry for every country code", () => {
        CountryCodes.forEach((code) => {
          expect(countryNamesGerman[code as CountryCode]).toBeDefined();
          expect(typeof countryNamesGerman[code as CountryCode]).toBe("string");
          expect(countryNamesGerman[code as CountryCode].length).toBeGreaterThan(0);
        });
      });
    });

    describe("countryNamesSpanish", () => {
      it("should have Spanish translations for major countries", () => {
        expect(countryNamesSpanish.US).toBe("Estados Unidos");
        expect(countryNamesSpanish.DE).toBe("Alemania");
        expect(countryNamesSpanish.ES).toBe("España");
        expect(countryNamesSpanish.FR).toBe("Francia");
      });
    });
  });

  describe("getRegionNames function", () => {
    it("should return English names by default", () => {
      const names = getRegionNames("en");
      expect(names.US).toBe("United States");
      expect(names.DE).toBe("Germany");
    });

    it('should return German names for "de" language', () => {
      const names = getRegionNames("de");
      expect(names.US).toBe("Vereinigte Staaten");
      expect(names.DE).toBe("Deutschland");
    });

    it('should return Spanish names for "es" language', () => {
      const names = getRegionNames("es");
      expect(names.US).toBe("Estados Unidos");
      expect(names.DE).toBe("Alemania");
    });

    it("should fall back to English for unknown languages", () => {
      const names = getRegionNames("fr"); // French not supported, should fall back
      expect(names.US).toBe("United States");
      expect(names.DE).toBe("Germany");
    });

    it("should fall back to English for empty string", () => {
      const names = getRegionNames("");
      expect(names.US).toBe("United States");
    });
  });

  describe("sortRegions function", () => {
    const testRegions = ["US", "DE", "GB", "FR", "JP"];

    it("should sort regions alphabetically by English names", () => {
      const sorted = sortRegions(testRegions, "en");
      const sortedNames = sorted.map((code) => countryNamesEnglish[code as CountryCode]);

      // Should be sorted: France, Germany, Japan, United Kingdom, United States
      expect(sorted[0]).toBe("FR"); // France
      expect(sorted[1]).toBe("DE"); // Germany
      expect(sorted[2]).toBe("JP"); // Japan
      expect(sorted[3]).toBe("GB"); // United Kingdom
      expect(sorted[4]).toBe("US"); // United States
    });

    it("should sort regions alphabetically by German names", () => {
      const sorted = sortRegions(testRegions, "de");
      const sortedNames = sorted.map((code) => countryNamesGerman[code as CountryCode]);

      // Should be sorted by German names
      expect(sorted[0]).toBe("DE"); // Deutschland comes first in German
    });

    it("should sort regions alphabetically by Spanish names", () => {
      const sorted = sortRegions(testRegions, "es");
      // Should be sorted by Spanish names
      expect(sorted).toHaveLength(testRegions.length);
    });

    it("should handle empty array", () => {
      const sorted = sortRegions([], "en");
      expect(sorted).toEqual([]);
    });

    it("should handle unknown country codes gracefully", () => {
      const regionsWithUnknown = ["US", "XX", "DE"];
      const sorted = sortRegions(regionsWithUnknown, "en");
      expect(sorted).toHaveLength(3);
      expect(sorted).toContain("XX"); // Unknown code should still be included
    });

    it("should not modify the original array", () => {
      const original = ["US", "DE", "GB"];
      const originalCopy = [...original];
      sortRegions(original, "en");
      expect(original).toEqual(originalCopy);
    });

    it("should handle single region", () => {
      const sorted = sortRegions(["US"], "en");
      expect(sorted).toEqual(["US"]);
    });

    it("should handle duplicate regions", () => {
      const withDuplicates = ["US", "DE", "US", "GB"];
      const sorted = sortRegions(withDuplicates, "en");
      expect(sorted).toHaveLength(4);
      expect(sorted.filter((code) => code === "US")).toHaveLength(2);
    });
  });

  describe("data consistency", () => {
    it("should have consistent data across all language dictionaries", () => {
      // All dictionaries should have the same country codes
      const englishCodes = Object.keys(countryNamesEnglish);
      const germanCodes = Object.keys(countryNamesGerman);

      expect(englishCodes.sort()).toEqual(germanCodes.sort());
    });

    it("should not have empty country names", () => {
      Object.values(countryNamesEnglish).forEach((name) => {
        expect(name.trim().length).toBeGreaterThan(0);
      });

      Object.values(countryNamesGerman).forEach((name) => {
        expect(name.trim().length).toBeGreaterThan(0);
      });
    });
  });
});
