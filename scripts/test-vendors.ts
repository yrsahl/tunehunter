/**
 * Vendor test script — runs songs against iTunes, Beatport, Bandcamp, and Amazon.
 *
 * Usage:
 *   bun scripts/test-vendors.ts               # all vendors, region GB
 *   bun scripts/test-vendors.ts --amazon      # Amazon-only regional sweep (all 8 regions)
 *   bun scripts/test-vendors.ts --region US   # all vendors, region US
 *
 * Strategy: first resolve the accurate duration from iTunes (which returns
 * exact trackTimeMillis), then pass that duration to Beatport, Bandcamp & Amazon
 * so the matching window works correctly even for approximate input durations.
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
const AMAZON_VENDOR   = { vendorId: 4, store: "amazon"   as const };

// Regions tested in the sweep:
//   ✅ expected to work: US, DE, FR, ES, IT (digital music store present, no WAF)
//   ❌ GB: WAF blocked  ❌ CA/AU: no digital music download store
const AMAZON_REGIONS = ["US", "DE", "FR", "ES", "IT", "GB", "CA", "AU"] as const;

// A small representative set for the Amazon regional sweep (avoids hammering servers)
const AMAZON_SWEEP_SONGS: { title: string; artist: string; durationMs: number }[] = [
  { title: "Get Lucky",       artist: "Daft Punk",    durationMs: 248_000 },
  { title: "Blinding Lights", artist: "The Weeknd",   durationMs: 200_000 },
  { title: "Strobe",          artist: "deadmau5",     durationMs: 637_000 },
  { title: "bad guy",         artist: "Billie Eilish", durationMs: 194_000 },
  { title: "Midnight City",   artist: "M83",           durationMs: 243_000 },
];

const args = process.argv.slice(2);
const AMAZON_SWEEP = args.includes("--amazon");
const REGION: string = (() => {
  const idx = args.indexOf("--region");
  return idx !== -1 && args[idx + 1] ? args[idx + 1]! : "GB";
})();

// ── helpers ──────────────────────────────────────────────────────────────────

const pad = (s: string, n: number) => s.slice(0, n).padEnd(n);

function fmt(res: Awaited<ReturnType<typeof fetchVendorData>>): string {
  if ("error" in res && res.error) return "❌";
  if (!res.data) return "❌";
  const price = res.data.price ? `${res.data.price} ${res.data.currency}` : "free";
  return `✅ ${price}`;
}

/**
 * Resolve the accurate track duration from iTunes so that Beatport, Bandcamp
 * and Amazon matching gets precise input rather than our rough estimates.
 * Falls back to the hardcoded approximation if iTunes doesn't have the track.
 */
async function resolveItunes(title: string, artist: string, fallbackMs: number, region = REGION): Promise<{ durationMs: number; itunesResult: Awaited<ReturnType<typeof fetchVendorData>> }> {
  const itunesResult = await fetchVendorData({
    vendorData: ITUNES_VENDOR,
    region,
    songData: { songId: "test", title, artist, duration: fallbackMs },
  });
  const durationMs = itunesResult.data?.duration ?? fallbackMs;
  return { durationMs, itunesResult };
}

// ── all-vendor test ───────────────────────────────────────────────────────────

async function testSong(song: (typeof SONGS)[0]) {
  const { title, artist, durationMs: approxMs } = song;
  const songId = "test";

  // Step 1: resolve exact duration from iTunes
  const { durationMs, itunesResult } = await resolveItunes(title, artist, approxMs);

  // Step 2: test Beatport, Bandcamp and Amazon with the resolved duration
  const [beatport, bandcamp, amazon] = await Promise.all([
    fetchVendorData({ vendorData: BEATPORT_VENDOR, region: REGION, songData: { songId, title, artist, duration: durationMs } }),
    fetchVendorData({ vendorData: BANDCAMP_VENDOR, region: REGION, songData: { songId, title, artist, duration: durationMs } }),
    fetchVendorData({ vendorData: AMAZON_VENDOR,   region: REGION, songData: { songId, title, artist, duration: durationMs } }),
  ]);

  return { title, artist, itunes: itunesResult, beatport, bandcamp, amazon };
}

async function runAllVendors() {
  console.log("\n=== Vendor test run ===");
  console.log(`Region: ${REGION}  |  Songs: ${SONGS.length}\n`);
  console.log(
    `${"Song (title — artist)".padEnd(42)}  ${"iTunes".padEnd(18)}  ${"Beatport".padEnd(18)}  ${"Bandcamp".padEnd(18)}  ${"Amazon".padEnd(18)}`
  );
  console.log("─".repeat(125));

  let itunesHits = 0;
  let beatportHits = 0;
  let bandcampHits = 0;
  let amazonHits = 0;

  // Sequential to avoid hammering servers
  for (const song of SONGS) {
    try {
      const result = await testSong(song);
      const label = `${result.title} — ${result.artist}`;
      const itunesFmt   = fmt(result.itunes);
      const beatportFmt = fmt(result.beatport);
      const bandcampFmt = fmt(result.bandcamp);
      const amazonFmt   = fmt(result.amazon);
      if (!("error" in result.itunes   && result.itunes.error))   itunesHits++;
      if (!("error" in result.beatport && result.beatport.error)) beatportHits++;
      if (!("error" in result.bandcamp && result.bandcamp.error)) bandcampHits++;
      if (!("error" in result.amazon   && result.amazon.error))   amazonHits++;
      console.log(`${pad(label, 42)}  ${pad(itunesFmt, 18)}  ${pad(beatportFmt, 18)}  ${pad(bandcampFmt, 18)}  ${pad(amazonFmt, 18)}`);
    } catch (e) {
      console.log(`${pad(`${song.title} — ${song.artist}`, 42)}  ERROR: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log("─".repeat(125));
  console.log(`\nHits: iTunes ${itunesHits}/${SONGS.length}  |  Beatport ${beatportHits}/${SONGS.length}  |  Bandcamp ${bandcampHits}/${SONGS.length}  |  Amazon ${amazonHits}/${SONGS.length}`);
}

// ── Amazon regional sweep ─────────────────────────────────────────────────────

async function runAmazonSweep() {
  console.log("\n=== Amazon regional sweep ===");
  console.log(`Songs: ${AMAZON_SWEEP_SONGS.length}  |  Regions: ${AMAZON_REGIONS.join(", ")}\n`);

  const songCol = 32;
  const regionCol = 14;
  const header = `${"Song (title — artist)".padEnd(songCol)}  ${AMAZON_REGIONS.map((r) => r.padEnd(regionCol)).join("  ")}`;
  console.log(header);
  console.log("─".repeat(header.length));

  const hits: Record<string, number> = Object.fromEntries(AMAZON_REGIONS.map((r) => [r, 0]));

  for (const song of AMAZON_SWEEP_SONGS) {
    const { title, artist, durationMs: approxMs } = song;
    // Resolve duration once from US iTunes (most reliable)
    const { durationMs } = await resolveItunes(title, artist, approxMs, "US");

    // Test all regions in parallel
    const results = await Promise.all(
      AMAZON_REGIONS.map((region) =>
        fetchVendorData({
          vendorData: AMAZON_VENDOR,
          region,
          songData: { songId: "test", title, artist, duration: durationMs },
        })
      )
    );

    const label = `${title} — ${artist}`;
    const cells = results.map((res, i) => {
      const r = AMAZON_REGIONS[i]!;
      const cell = fmt(res);
      if (!("error" in res && res.error)) hits[r]!++;
      return pad(cell, regionCol);
    });
    console.log(`${pad(label, songCol)}  ${cells.join("  ")}`);

    // Pause between songs to avoid triggering Amazon's IP-rate-limit WAF.
    // (Not needed in production where each serverless invocation has a fresh IP.)
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log("─".repeat(header.length));
  const hitLine = AMAZON_REGIONS.map((r) => `${r}: ${hits[r]}/${AMAZON_SWEEP_SONGS.length}`).join("  ");
  console.log(`\nHits  ${hitLine}`);
}

// ── entry point ───────────────────────────────────────────────────────────────

async function main() {
  if (AMAZON_SWEEP) {
    await runAmazonSweep();
  } else {
    await runAllVendors();
  }
}

main().catch(console.error);
