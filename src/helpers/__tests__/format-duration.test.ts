import { describe, expect, it } from "vitest";
import { formatDuration } from "../format-duration";

describe("formatDuration", () => {
  it("should format duration correctly for minutes and seconds", () => {
    expect(formatDuration(123000)).toBe("2:03"); // 2 minutes 3 seconds
    expect(formatDuration(180000)).toBe("3:00"); // 3 minutes exactly
    expect(formatDuration(65000)).toBe("1:05"); // 1 minute 5 seconds
  });

  it("should handle seconds less than 10 with leading zero", () => {
    expect(formatDuration(60500)).toBe("1:00"); // 1 minute 0.5 seconds (rounds down)
    expect(formatDuration(67000)).toBe("1:07"); // 1 minute 7 seconds
  });

  it("should handle durations less than a minute", () => {
    expect(formatDuration(30000)).toBe("0:30"); // 30 seconds
    expect(formatDuration(5000)).toBe("0:05"); // 5 seconds
    expect(formatDuration(500)).toBe("0:00"); // 0.5 seconds (rounds down)
  });

  it("should handle zero duration", () => {
    expect(formatDuration(0)).toBe("0:00");
  });

  it("should handle longer durations", () => {
    expect(formatDuration(600000)).toBe("10:00"); // 10 minutes
    expect(formatDuration(3661000)).toBe("61:01"); // 61 minutes 1 second
  });
});
