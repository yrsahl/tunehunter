import { formatDate } from "@/lib/formatters/date";
import { describe, expect, it } from "vitest";

describe("formatDate", () => {
  it("formats day-only date in long form by default", () => {
    const value = formatDate(new Date(2024, 0, 1, 9, 5));

    expect(value).toContain("1st");
    expect(value).toContain("2024");
    expect(value).toMatch(/of/);
  });

  it("formats date-time when dayOnly is false", () => {
    const value = formatDate(new Date(2024, 0, 2, 9, 5), false);

    expect(value).toContain("2024");
    expect(value).toContain("at 09:05");
  });

  it("formats short form with comma", () => {
    const value = formatDate(new Date(2024, 5, 3), true, true);

    expect(value).toContain("3rd");
    expect(value).toContain(", 2024");
  });
});
