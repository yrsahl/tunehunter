import { filterOutDuplicates } from "@/lib/filters/queries";
import { describe, expect, it } from "vitest";

const makeTrack = (id: string, title: string, duration: number) => ({
  song: { id, title, duration },
  artists: [],
});

describe("filterOutDuplicates", () => {
  it("keeps only one track per title+duration combination", () => {
    const firstTrack = makeTrack("1", "Song A", 180_000);
    const duplicateTrack = makeTrack("2", "Song A", 180_000);
    const differentDuration = makeTrack("3", "Song A", 181_000);

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
