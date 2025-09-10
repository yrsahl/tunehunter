import { describe, expect, it } from "vitest";
import { formatDate } from "../format-date";

describe("formatDate", () => {
  // Create consistent test dates to avoid timezone issues
  const testDate = new Date("2024-03-15T14:30:00Z"); // March 15th, 2024 at 14:30 UTC

  describe("day formatting with ordinal suffixes", () => {
    it("should format 1st correctly", () => {
      const date = new Date("2024-03-01T12:00:00Z");
      expect(formatDate(date)).toBe("1st of March, 2024");
    });

    it("should format 2nd correctly", () => {
      const date = new Date("2024-03-02T12:00:00Z");
      expect(formatDate(date)).toBe("2nd of March, 2024");
    });

    it("should format 3rd correctly", () => {
      const date = new Date("2024-03-03T12:00:00Z");
      expect(formatDate(date)).toBe("3rd of March, 2024");
    });

    it('should format 4th-20th with "th" suffix', () => {
      const date4th = new Date("2024-03-04T12:00:00Z");
      const date11th = new Date("2024-03-11T12:00:00Z");
      const date20th = new Date("2024-03-20T12:00:00Z");

      expect(formatDate(date4th)).toBe("4th of March, 2024");
      expect(formatDate(date11th)).toBe("11th of March, 2024");
      expect(formatDate(date20th)).toBe("20th of March, 2024");
    });

    it("should format 21st, 22nd, 23rd correctly", () => {
      const date21st = new Date("2024-03-21T12:00:00Z");
      const date22nd = new Date("2024-03-22T12:00:00Z");
      const date23rd = new Date("2024-03-23T12:00:00Z");

      expect(formatDate(date21st)).toBe("21st of March, 2024");
      expect(formatDate(date22nd)).toBe("22nd of March, 2024");
      expect(formatDate(date23rd)).toBe("23rd of March, 2024");
    });

    it("should format 31st correctly", () => {
      const date = new Date("2024-03-31T12:00:00Z");
      expect(formatDate(date)).toBe("31st of March, 2024");
    });
  });

  describe("dayOnly parameter", () => {
    it("should return only date when dayOnly is true (default)", () => {
      const result = formatDate(testDate);
      expect(result).toBe("15th of March, 2024");
      expect(result).not.toContain("at");
    });

    it("should return date and time when dayOnly is false", () => {
      const result = formatDate(testDate, false);
      expect(result).toBe("15th of March, 2024 at 14:30");
    });
  });

  describe("shortForm parameter", () => {
    it("should use long form by default", () => {
      const result = formatDate(testDate);
      expect(result).toBe("15th of March, 2024");
    });

    it("should use short form when shortForm is true", () => {
      const result = formatDate(testDate, true, true);
      expect(result).toBe("March 15th, 2024");
    });

    it("should use short form with time when both flags are set", () => {
      const result = formatDate(testDate, false, true);
      expect(result).toBe("March 15th, 2024 at 14:30");
    });
  });

  describe("time formatting", () => {
    it("should format single digit hours and minutes with leading zeros", () => {
      const earlyDate = new Date("2024-03-15T09:05:00Z");
      const result = formatDate(earlyDate, false);
      expect(result).toBe("15th of March, 2024 at 09:05");
    });

    it("should handle midnight correctly", () => {
      const midnightDate = new Date("2024-03-15T00:00:00Z");
      const result = formatDate(midnightDate, false);
      expect(result).toBe("15th of March, 2024 at 00:00");
    });

    it("should handle late evening correctly", () => {
      const lateDate = new Date("2024-03-15T23:59:00Z");
      const result = formatDate(lateDate, false);
      expect(result).toBe("15th of March, 2024 at 23:59");
    });
  });

  describe("different months and years", () => {
    it("should format different months correctly", () => {
      const janDate = new Date("2024-01-01T12:00:00Z");
      const decDate = new Date("2024-12-25T12:00:00Z");

      expect(formatDate(janDate)).toBe("1st of January, 2024");
      expect(formatDate(decDate)).toBe("25th of December, 2024");
    });

    it("should format different years correctly", () => {
      const date2023 = new Date("2023-06-15T12:00:00Z");
      const date2025 = new Date("2025-06-15T12:00:00Z");

      expect(formatDate(date2023)).toBe("15th of June, 2023");
      expect(formatDate(date2025)).toBe("15th of June, 2025");
    });
  });
});
