/**
 * Vendor test script — runs 32 songs against iTunes, Beatport, Bandcamp
 * and prints a results table.
 *
 * Run with: npx tsx scripts/test-vendors.ts
 *
 * Strategy: first resolve the accurate duration from iTunes (which returns
 * exact trackTimeMillis), then pass that duration to Beatport & Bandcamp so
 * the 2s matching window works correctly even for approximate input durations.
 */

import { fetchVendorData } from "../src/services/vendors/api";

// Approximate durations (ms) — good enough for iTunes resolution.
// iTunes then gives us the exact value to pass downstream.
const SONGS: { title: string; artist: string; durationMs: number }[] = [
  // Mainstream
  { title: "Get Lucky",          artist: "Daft Punk",               durationMs: 248_000 },
  { title: "Creep",              artist: "Radiohead",               durationMs: 236_000 },
  { title: "Blinding Lights",    artist: "The Weeknd",              durationMs: 200_000 },
  { title: "bad guy",            artist: "Billie Eilish",           durationMs: 194_000 },
  { title: "R U Mine?",          artist: "Arctic Monkeys",          durationMs: 201_000 },
  // Electronic / Beatport-heavy
  { title: "Opus",               artist: "Eric Prydz",              durationMs: 546_000 },
  { title: "Bad Kingdom",        artist: "Moderat",                 durationMs: 327_000 },
  { title: "Sing",               artist: "Four Tet",                durationMs: 395_000 },
  { title: "Glue",               artist: "Bicep",                   durationMs: 392_000 },
  { title: "Can't Do Without You", artist: "Caribou",               durationMs: 272_000 },
  { title: "Avril 14th",         artist: "Aphex Twin",              durationMs: 125_000 },
  { title: "Kiara",              artist: "Bonobo",                  durationMs: 459_000 },
  { title: "Archangel",          artist: "Burial",                  durationMs: 234_000 },
  // Bandcamp-heavy / indie
  { title: "LesAlpx",            artist: "Floating Points",         durationMs: 315_000 },
  { title: "Sea Calls Me Home",  artist: "Julia Holter",            durationMs: 250_000 },
  { title: "Before I Move Off",  artist: "Mount Kimbie",            durationMs: 220_000 },
  { title: "Hubble",             artist: "Actress",                 durationMs: 300_000 },
  { title: "Ljoss",              artist: "Forest Swords",           durationMs: 270_000 },
  { title: "Says",               artist: "Nils Frahm",              durationMs: 562_000 },
  // Special characters / tricky names
  { title: "Piel",               artist: "Arca",                    durationMs: 180_000 },
  { title: "Say the Name",       artist: "clipping.",               durationMs: 210_000 },
  { title: "I Want to Be Forgotten", artist: "$uicideboy$",         durationMs: 150_000 },
  { title: "Midnight City",      artist: "M83",                     durationMs: 243_000 },
  { title: "Hoppípolla",         artist: "Sigur Rós",               durationMs: 266_000 },
  { title: "Strobe",             artist: "deadmau5",                durationMs: 637_000 },
  // Collaborations / multi-artist
  { title: "Loud Places",        artist: "Jamie xx",                durationMs: 293_000 },
  { title: "All the Stars",      artist: "Kendrick Lamar",          durationMs: 232_000 },
  { title: "Teardrop",           artist: "Massive Attack",          durationMs: 329_000 },
  // Duration edge cases / niche
  { title: "Oblivion",           artist: "Grimes",                  durationMs: 302_000 },
  { title: "New Slaves",         artist: "Kanye West",              durationMs: 254_000 },
  { title: "Dracula Mountain",   artist: "Lightning Bolt",          durationMs: 480_000 },
  // False-positive trap: this is a Bon Iver song, not a James Blake collab
  { title: "Re:Stacks",          artist: "Bon Iver",                durationMs: 254_000 },
];

const ITUNES_VENDOR   = { vendorId: 1, store: "itunes"   as const };
const BEATPORT_VENDOR = { vendorId: 3, store: "beatport" as const };
const BANDCAMP_VENDOR = { vendorId: 2, store: "bandcamp" as const };

const REGION = "GB";

// ── helpers ──────────────────────────────────────────────────────────────────

const pad = (s: string, n: number) => s.slice(0, n).padEnd(n);

function fmt(res: Awaited<ReturnType<typeof fetchVendorData>>): string {
  if ("error" in res && res.error) return "❌";
  if (!res.data) return "❌";
  const price = res.data.price ? `${res.data.price} ${res.data.currency}` : "free";
  return `✅ ${price}`;
}

/**
 * Resolve the accurate track duration from iTunes so that Beatport and Bandcamp
 * matching (which require ±2 s) gets precise input rather than our rough estimates.
 * Falls back to the hardcoded approximation if iTunes doesn't have the track.
 */
async function resolveItunes(title: string, artist: string, fallbackMs: number): Promise<{ durationMs: number; itunesResult: Awaited<ReturnType<typeof fetchVendorData>> }> {
  const itunesResult = await fetchVendorData({
    vendorData: ITUNES_VENDOR,
    region: REGION,
    songData: { songId: "test", title, artist, duration: fallbackMs },
  });
  const durationMs = (itunesResult.data?.duration) ?? fallbackMs;
  return { durationMs, itunesResult };
}

// ── main ─────────────────────────────────────────────────────────────────────

async function testSong(song: (typeof SONGS)[0]) {
  const { title, artist, durationMs: approxMs } = song;
  const songId = "test";

  // Step 1: resolve exact duration from iTunes
  const { durationMs, itunesResult } = await resolveItunes(title, artist, approxMs);

  // Step 2: test Beatport and Bandcamp with the resolved duration
  const [beatport, bandcamp] = await Promise.all([
    fetchVendorData({ vendorData: BEATPORT_VENDOR, region: REGION, songData: { songId, title, artist, duration: durationMs } }),
    fetchVendorData({ vendorData: BANDCAMP_VENDOR, region: REGION, songData: { songId, title, artist, duration: durationMs } }),
  ]);

  return { title, artist, itunes: itunesResult, beatport, bandcamp };
}

async function main() {
  console.log("\n=== Vendor test run ===");
  console.log(`Region: ${REGION}  |  Songs: ${SONGS.length}\n`);
  console.log(
    `${"Song (title — artist)".padEnd(42)}  ${"iTunes".padEnd(20)}  ${"Beatport".padEnd(20)}  ${"Bandcamp".padEnd(20)}`
  );
  console.log("─".repeat(110));

  let itunesHits = 0, beatportHits = 0, bandcampHits = 0;

  // Sequential to avoid hammering servers
  for (const song of SONGS) {
    try {
      const result = await testSong(song);
      const label = `${result.title} — ${result.artist}`;
      const itunesFmt   = fmt(result.itunes);
      const beatportFmt = fmt(result.beatport);
      const bandcampFmt = fmt(result.bandcamp);
      if (!("error" in result.itunes   && result.itunes.error))   itunesHits++;
      if (!("error" in result.beatport && result.beatport.error)) beatportHits++;
      if (!("error" in result.bandcamp && result.bandcamp.error)) bandcampHits++;
      console.log(`${pad(label, 42)}  ${pad(itunesFmt, 20)}  ${pad(beatportFmt, 20)}  ${pad(bandcampFmt, 20)}`);
    } catch (e) {
      console.log(`${pad(`${song.title} — ${song.artist}`, 42)}  ERROR: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log("─".repeat(110));
  console.log(`\nHits: iTunes ${itunesHits}/${SONGS.length}  |  Beatport ${beatportHits}/${SONGS.length}  |  Bandcamp ${bandcampHits}/${SONGS.length}`);
}

main().catch(console.error);
