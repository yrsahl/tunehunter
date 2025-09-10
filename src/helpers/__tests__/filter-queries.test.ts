import { SpotifySearchData } from "@/types/spotify-types";
import { describe, expect, it } from "vitest";
import { filterOutDuplicates } from "../filter-queries";

describe("filter-queries utilities", () => {
  describe("filterOutDuplicates", () => {
    const createMockTrack = (name: string, duration: number, id: string) => ({
      id,
      name,
      duration_ms: duration,
      artists: [{ id: "artist1", name: "Test Artist" }],
      album: {
        id: "album1",
        name: "Test Album",
        images: [],
      },
      external_urls: { spotify: `https://open.spotify.com/track/${id}` },
      href: `https://api.spotify.com/v1/tracks/${id}`,
      popularity: 50,
      preview_url: null,
      track_number: 1,
      type: "track" as const,
      uri: `spotify:track:${id}`,
      is_local: false,
      explicit: false,
      available_markets: ["US"],
      disc_number: 1,
      is_playable: true,
    });

    const createMockSearchData = (tracks: any[]): SpotifySearchData => ({
      tracks: {
        items: tracks,
        total: tracks.length,
        limit: 20,
        offset: 0,
        href: "https://api.spotify.com/v1/search",
        next: null,
        previous: null,
      },
    });

    it("should remove exact duplicates (same name and duration)", () => {
      const tracks = [
        createMockTrack("Song A", 180000, "track1"),
        createMockTrack("Song A", 180000, "track2"), // Duplicate
        createMockTrack("Song B", 200000, "track3"),
      ];

      const searchData = createMockSearchData(tracks);
      const filtered = filterOutDuplicates(searchData);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].name).toBe("Song A");
      expect(filtered[1].name).toBe("Song B");
    });

    it("should keep tracks with same name but different duration", () => {
      const tracks = [
        createMockTrack("Song A", 180000, "track1"), // Original
        createMockTrack("Song A", 200000, "track2"), // Extended mix
        createMockTrack("Song A", 120000, "track3"), // Radio edit
      ];

      const searchData = createMockSearchData(tracks);
      const filtered = filterOutDuplicates(searchData);

      expect(filtered).toHaveLength(3);
      expect(filtered.every((track) => track.name === "Song A")).toBe(true);
      expect(filtered.map((track) => track.duration_ms)).toEqual([180000, 200000, 120000]);
    });

    it("should keep tracks with different names but same duration", () => {
      const tracks = [
        createMockTrack("Song A", 180000, "track1"),
        createMockTrack("Song B", 180000, "track2"),
        createMockTrack("Song C", 180000, "track3"),
      ];

      const searchData = createMockSearchData(tracks);
      const filtered = filterOutDuplicates(searchData);

      expect(filtered).toHaveLength(3);
      expect(filtered.map((track) => track.name)).toEqual(["Song A", "Song B", "Song C"]);
    });

    it("should handle empty tracks array", () => {
      const searchData = createMockSearchData([]);
      const filtered = filterOutDuplicates(searchData);

      expect(filtered).toHaveLength(0);
      expect(filtered).toEqual([]);
    });

    it("should handle single track", () => {
      const tracks = [createMockTrack("Single Song", 180000, "track1")];
      const searchData = createMockSearchData(tracks);
      const filtered = filterOutDuplicates(searchData);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Single Song");
    });

    it("should preserve the first occurrence of duplicates", () => {
      const tracks = [
        createMockTrack("Song A", 180000, "first-occurrence"),
        createMockTrack("Song B", 200000, "unique-track"),
        createMockTrack("Song A", 180000, "second-occurrence"), // Should be filtered out
        createMockTrack("Song A", 180000, "third-occurrence"), // Should be filtered out
      ];

      const searchData = createMockSearchData(tracks);
      const filtered = filterOutDuplicates(searchData);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe("first-occurrence"); // First occurrence preserved
      expect(filtered[1].id).toBe("unique-track");
    });

    it("should handle tracks with special characters in names", () => {
      const tracks = [
        createMockTrack("Song (Remix)", 180000, "track1"),
        createMockTrack("Song (Remix)", 180000, "track2"), // Duplicate
        createMockTrack("Song [Extended]", 200000, "track3"),
        createMockTrack("Song & Another", 150000, "track4"),
      ];

      const searchData = createMockSearchData(tracks);
      const filtered = filterOutDuplicates(searchData);

      expect(filtered).toHaveLength(3);
      expect(filtered.map((track) => track.name)).toEqual([
        "Song (Remix)",
        "Song [Extended]",
        "Song & Another",
      ]);
    });

    it("should handle tracks with very long names", () => {
      const longName = "A".repeat(500); // Very long track name
      const tracks = [
        createMockTrack(longName, 180000, "track1"),
        createMockTrack(longName, 180000, "track2"), // Duplicate
        createMockTrack("Normal Song", 180000, "track3"),
      ];

      const searchData = createMockSearchData(tracks);
      const filtered = filterOutDuplicates(searchData);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].name).toBe(longName);
      expect(filtered[1].name).toBe("Normal Song");
    });

    it("should handle tracks with zero duration", () => {
      const tracks = [
        createMockTrack("Song A", 0, "track1"),
        createMockTrack("Song A", 0, "track2"), // Duplicate
        createMockTrack("Song B", 180000, "track3"),
      ];

      const searchData = createMockSearchData(tracks);
      const filtered = filterOutDuplicates(searchData);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].duration_ms).toBe(0);
      expect(filtered[1].duration_ms).toBe(180000);
    });

    it("should create a new array and not modify the original", () => {
      const tracks = [
        createMockTrack("Song A", 180000, "track1"),
        createMockTrack("Song A", 180000, "track2"),
      ];

      const searchData = createMockSearchData(tracks);
      const originalLength = searchData.tracks!.items.length;
      const filtered = filterOutDuplicates(searchData);

      expect(searchData.tracks!.items).toHaveLength(originalLength);
      expect(filtered).toHaveLength(1);
      expect(filtered).not.toBe(searchData.tracks!.items); // Should be a new array
    });

    it("should use Map for efficient deduplication", () => {
      // Test with a large number of duplicates to ensure Map efficiency
      const tracks = [];
      for (let i = 0; i < 100; i++) {
        tracks.push(createMockTrack("Repeated Song", 180000, `track${i}`));
      }

      const searchData = createMockSearchData(tracks);
      const filtered = filterOutDuplicates(searchData);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe("Repeated Song");
    });
  });
});
