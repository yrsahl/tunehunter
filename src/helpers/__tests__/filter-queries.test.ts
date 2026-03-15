import { filterOutDuplicates } from "@/lib/filters/queries";
import { describe, expect, it } from "vitest";

describe("filterOutDuplicates", () => {
  it("keeps only one track per name+duration combination", () => {
    const firstTrack = { id: "1", name: "Song A", duration_ms: 180000 };
    const duplicateTrack = { id: "2", name: "Song A", duration_ms: 180000 };
    const differentDuration = { id: "3", name: "Song A", duration_ms: 181000 };

    const searchData = {
      tracks: {
        items: [firstTrack, duplicateTrack, differentDuration],
      },
    } as any;

    const result = filterOutDuplicates(searchData);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(firstTrack);
    expect(result[1]).toBe(differentDuration);
  });
});
