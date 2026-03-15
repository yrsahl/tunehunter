import { formatDuration } from "@/lib/formatters/duration";
import { describe, expect, it } from "vitest";

describe("formatDuration", () => {
  it("formats milliseconds to mm:ss", () => {
    expect(formatDuration(125000)).toBe("2:05");
  });

  it("pads seconds with leading zero", () => {
    expect(formatDuration(61000)).toBe("1:01");
  });

  it("handles exact minute boundaries", () => {
    expect(formatDuration(180000)).toBe("3:00");
  });
});
