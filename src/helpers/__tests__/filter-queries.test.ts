import { applyFilters, filterOutDuplicates } from "@/lib/filters/queries";
import { SearchSettings } from "@/hooks/stores/useSearchSettingsStore";
import { describe, expect, it } from "vitest";

const makeTrack = (
  id: string,
  title: string,
  durationMs: number,
  year = "2020-01-01",
) => ({
  song: {
    id,
    title,
    duration: durationMs,
    year,
    album: null,
    albumArtUrl: null,
    genre: null,
    spotifyId: null,
    previewUrl: null,
    isrc: null,
  },
  artists: [],
});

const makeData = (tracks: ReturnType<typeof makeTrack>[]) => ({
  tracks: { items: [...tracks] },
});

const baseSettings: SearchSettings = {
  versionFilter: "all",
  lengthFilter: false,
  lengthRange: [120, 600],
  yearFilter: false,
  yearRange: [2000, 2030],
};

// ---------------------------------------------------------------------------
// filterOutDuplicates
// ---------------------------------------------------------------------------

describe("filterOutDuplicates", () => {
  it("keeps only one track per title+duration combination", () => {
    const firstTrack = makeTrack("1", "Song A", 180_000);
    const duplicateTrack = makeTrack("2", "Song A", 180_000);
    const differentDuration = makeTrack("3", "Song A", 181_000);

    const searchData = {
      tracks: { items: [firstTrack, duplicateTrack, differentDuration] },
    };

    const result = filterOutDuplicates(searchData);

    expect(result).toHaveLength(2);
    expect(result[0]).toBe(firstTrack);
    expect(result[1]).toBe(differentDuration);
  });
});

// ---------------------------------------------------------------------------
// applyFilters — versionFilter
// ---------------------------------------------------------------------------

describe("applyFilters — versionFilter", () => {
  const original = makeTrack("1", "Song A", 300_000);
  const remix = makeTrack("2", "Song A (Remix)", 300_000);
  const reEdit = makeTrack("3", "Song A (Re-Edit)", 300_000);
  const radioEdit = makeTrack("4", "Song A (Radio Edit)", 180_000);
  const extended = makeTrack("5", "Song A (Extended Mix)", 480_000);
  const clubMix = makeTrack("6", "Song A (Club Mix)", 420_000);
  const originalMix = makeTrack("7", "Song A (Original Mix)", 390_000);

  const all = [original, remix, reEdit, radioEdit, extended, clubMix, originalMix];

  it("returns all tracks when versionFilter is 'all'", () => {
    const data = makeData(all);
    const result = applyFilters(data, { ...baseSettings, versionFilter: "all" });
    expect(result.tracks.items).toHaveLength(7);
  });

  it("originals: excludes remixes, re-edits, and radio edits", () => {
    const data = makeData(all);
    const result = applyFilters(data, { ...baseSettings, versionFilter: "originals" });
    const titles = result.tracks.items.map((t) => t.song.title);
    expect(titles).toContain("Song A");
    expect(titles).toContain("Song A (Extended Mix)");
    expect(titles).toContain("Song A (Club Mix)");
    expect(titles).toContain("Song A (Original Mix)");
    expect(titles).not.toContain("Song A (Remix)");
    expect(titles).not.toContain("Song A (Re-Edit)");
    expect(titles).not.toContain("Song A (Radio Edit)");
  });

  it("remixes: keeps only tracks with remix keywords", () => {
    const data = makeData(all);
    const result = applyFilters(data, { ...baseSettings, versionFilter: "remixes" });
    const titles = result.tracks.items.map((t) => t.song.title);
    expect(titles).toContain("Song A (Remix)");
    expect(titles).toContain("Song A (Re-Edit)");
    expect(titles).not.toContain("Song A");
    expect(titles).not.toContain("Song A (Extended Mix)");
    expect(titles).not.toContain("Song A (Original Mix)");
  });

  it("extended: keeps only tracks with extended/club/original mix keywords", () => {
    const data = makeData(all);
    const result = applyFilters(data, { ...baseSettings, versionFilter: "extended" });
    const titles = result.tracks.items.map((t) => t.song.title);
    expect(titles).toContain("Song A (Extended Mix)");
    expect(titles).toContain("Song A (Club Mix)");
    expect(titles).toContain("Song A (Original Mix)");
    expect(titles).not.toContain("Song A");
    expect(titles).not.toContain("Song A (Remix)");
  });

  it("versionFilter is case-insensitive", () => {
    const upperRemix = makeTrack("8", "Song A (REMIX)", 300_000);
    const data = makeData([upperRemix]);
    const result = applyFilters(data, { ...baseSettings, versionFilter: "remixes" });
    expect(result.tracks.items).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// applyFilters — lengthFilter
// ---------------------------------------------------------------------------

describe("applyFilters — lengthFilter", () => {
  const short = makeTrack("1", "Short", 60_000);   // 60s
  const medium = makeTrack("2", "Medium", 300_000); // 300s
  const long = makeTrack("3", "Long", 720_000);     // 720s

  it("does not filter when lengthFilter is false", () => {
    const data = makeData([short, medium, long]);
    const result = applyFilters(data, { ...baseSettings, lengthFilter: false, lengthRange: [120, 600] });
    expect(result.tracks.items).toHaveLength(3);
  });

  it("keeps only tracks within the length range", () => {
    const data = makeData([short, medium, long]);
    const result = applyFilters(data, { ...baseSettings, lengthFilter: true, lengthRange: [120, 600] });
    const titles = result.tracks.items.map((t) => t.song.title);
    expect(titles).not.toContain("Short");
    expect(titles).toContain("Medium");
    expect(titles).not.toContain("Long");
  });

  it("includes tracks exactly at the range boundaries", () => {
    const atMin = makeTrack("4", "At min", 120_000);  // exactly 120s
    const atMax = makeTrack("5", "At max", 600_000);  // exactly 600s
    const data = makeData([atMin, atMax]);
    const result = applyFilters(data, { ...baseSettings, lengthFilter: true, lengthRange: [120, 600] });
    expect(result.tracks.items).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// applyFilters — yearFilter
// ---------------------------------------------------------------------------

describe("applyFilters — yearFilter", () => {
  const old = makeTrack("1", "Old", 300_000, "1990-06-01");
  const recent = makeTrack("2", "Recent", 300_000, "2010-03-15");
  const newer = makeTrack("3", "Newer", 300_000, "2022-11-01");

  it("does not filter when yearFilter is false", () => {
    const data = makeData([old, recent, newer]);
    const result = applyFilters(data, { ...baseSettings, yearFilter: false, yearRange: [2000, 2020] });
    expect(result.tracks.items).toHaveLength(3);
  });

  it("keeps only tracks within the year range", () => {
    const data = makeData([old, recent, newer]);
    const result = applyFilters(data, { ...baseSettings, yearFilter: true, yearRange: [2000, 2020] });
    const titles = result.tracks.items.map((t) => t.song.title);
    expect(titles).not.toContain("Old");
    expect(titles).toContain("Recent");
    expect(titles).not.toContain("Newer");
  });

  it("handles ISO date strings by parsing the year prefix", () => {
    const track = makeTrack("4", "Track", 300_000, "2015-07-20");
    const data = makeData([track]);
    const result = applyFilters(data, { ...baseSettings, yearFilter: true, yearRange: [2010, 2020] });
    expect(result.tracks.items).toHaveLength(1);
  });

  it("excludes tracks with unparseable year values", () => {
    const track = makeTrack("5", "Track", 300_000, "");
    const data = makeData([track]);
    const result = applyFilters(data, { ...baseSettings, yearFilter: true, yearRange: [2000, 2030] });
    expect(result.tracks.items).toHaveLength(0);
  });

  it("includes tracks at boundary years", () => {
    const atMin = makeTrack("6", "At min", 300_000, "2000-01-01");
    const atMax = makeTrack("7", "At max", 300_000, "2030-12-31");
    const data = makeData([atMin, atMax]);
    const result = applyFilters(data, { ...baseSettings, yearFilter: true, yearRange: [2000, 2030] });
    expect(result.tracks.items).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// applyFilters — combined filters
// ---------------------------------------------------------------------------

describe("applyFilters — combined filters", () => {
  it("applies versionFilter and lengthFilter together", () => {
    const shortOriginal = makeTrack("1", "Song A", 60_000);           // too short, original
    const longOriginal = makeTrack("2", "Song A", 300_000);           // in range, original
    const shortRemix = makeTrack("3", "Song A (Remix)", 60_000);      // too short, remix
    const longRemix = makeTrack("4", "Song A (Remix)", 300_000);      // in range, remix

    const data = makeData([shortOriginal, longOriginal, shortRemix, longRemix]);
    const result = applyFilters(data, {
      ...baseSettings,
      versionFilter: "originals",
      lengthFilter: true,
      lengthRange: [120, 600],
    });

    const titles = result.tracks.items.map((t) => t.song.title);
    expect(titles).toEqual(["Song A"]);
  });
});

// ---------------------------------------------------------------------------
// applyFilters — no settings
// ---------------------------------------------------------------------------

describe("applyFilters — no settings", () => {
  it("still deduplicates when no settings are passed", () => {
    const a = makeTrack("1", "Song", 300_000);
    const b = makeTrack("2", "Song", 300_000);
    const data = makeData([a, b]);
    const result = applyFilters(data, undefined);
    expect(result.tracks.items).toHaveLength(1);
  });
});
