/**
 * Vendor test script — runs songs against all configured vendors.
 *
 * Usage:
 *   bun scripts/test-vendors.ts                     # all vendors, region GB
 *   bun scripts/test-vendors.ts --region US         # all vendors, region US
 *   bun scripts/test-vendors.ts --amazon            # Amazon-only regional sweep (all 8 regions)
 *   bun scripts/test-vendors.ts --vendor traxsource # single vendor, region GB
 *
 * Strategy: first resolve the accurate duration from iTunes (which returns
 * exact trackTimeMillis), then pass that duration to all downstream vendors
 * so the matching window works correctly even for approximate input durations.
 */

import { fetchVendorData } from "../src/services/vendors/api";
import type { SongVendorType } from "../src/server/db/schema";

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
  { title: "Archangel",         artist: "Burial",                  durationMs: 234_000 },
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

// Vendor registry — IDs match the insertion order in the migration.
const VENDORS: Record<SongVendorType, { vendorId: number; store: SongVendorType }> = {
  itunes:       { vendorId: 1, store: "itunes" },
  bandcamp:     { vendorId: 2, store: "bandcamp" },
  beatport:     { vendorId: 3, store: "beatport" },
  amazon:       { vendorId: 4, store: "amazon" },
  traxsource:   { vendorId: 5, store: "traxsource" },
  junodownload: { vendorId: 6, store: "junodownload" },
  qobuz:        { vendorId: 7, store: "qobuz" },
  hdtracks:     { vendorId: 8, store: "hdtracks" },
  sevendigital: { vendorId: 9, store: "sevendigital" },
};

// Vendors shown in the standard all-vendor table run.
// itunes is used internally for duration resolution so it always runs first.
const PRIMARY_VENDORS: SongVendorType[] = [
  "beatport", "bandcamp", "amazon",
  "traxsource", "junodownload", "qobuz", "hdtracks", "sevendigital",
];

// Regions tested in the Amazon sweep
const AMAZON_REGIONS = ["US", "DE", "FR", "ES", "IT", "GB", "CA", "AU"] as const;

const AMAZON_SWEEP_SONGS: { title: string; artist: string; durationMs: number }[] = [
  { title: "Get Lucky",       artist: "Daft Punk",     durationMs: 248_000 },
  { title: "Blinding Lights", artist: "The Weeknd",    durationMs: 200_000 },
  { title: "Strobe",          artist: "deadmau5",      durationMs: 637_000 },
  { title: "bad guy",         artist: "Billie Eilish", durationMs: 194_000 },
  { title: "Midnight City",   artist: "M83",           durationMs: 243_000 },
];

// ── CLI args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const AMAZON_SWEEP = args.includes("--amazon");
const REGION: string = (() => {
  const idx = args.indexOf("--region");
  return idx !== -1 && args[idx + 1] ? args[idx + 1]! : "GB";
})();
const SINGLE_VENDOR: SongVendorType | undefined = (() => {
  const idx = args.indexOf("--vendor");
  const name = idx !== -1 ? args[idx + 1] : undefined;
  return name && name in VENDORS ? (name as SongVendorType) : undefined;
})();

// ── Helpers ───────────────────────────────────────────────────────────────────

const pad = (s: string, n: number) => s.slice(0, n).padEnd(n);

function fmt(res: Awaited<ReturnType<typeof fetchVendorData>>): string {
  if ("error" in res && res.error) return "❌";
  if (!res.data) return "❌";
  const price = res.data.price ? `${res.data.price} ${res.data.currency}` : "free";
  return `✅ ${price}`;
}

async function resolveItunes(
  title: string,
  artist: string,
  fallbackMs: number,
  region = REGION,
): Promise<{ durationMs: number; itunesResult: Awaited<ReturnType<typeof fetchVendorData>> }> {
  const itunesResult = await fetchVendorData({
    vendorData: VENDORS.itunes,
    region,
    songData: { songId: "test", title, artist, duration: fallbackMs },
  });
  const durationMs = itunesResult.data?.duration ?? fallbackMs;
  return { durationMs, itunesResult };
}

// ── Single-vendor run ─────────────────────────────────────────────────────────

async function runSingleVendor(vendorKey: SongVendorType) {
  const vendor = VENDORS[vendorKey];
  console.log(`\n=== Single-vendor test: ${vendorKey} ===`);
  console.log(`Region: ${REGION}  |  Songs: ${SONGS.length}\n`);
  const col = 42;
  const vcol = 20;
  console.log(`${"Song (title — artist)".padEnd(col)}  ${"iTunes".padEnd(vcol)}  ${vendorKey.padEnd(vcol)}`);
  console.log("─".repeat(col + vcol * 2 + 6));

  let hits = 0;
  for (const song of SONGS) {
    try {
      const { title, artist, durationMs: approxMs } = song;
      const { durationMs, itunesResult } = await resolveItunes(title, artist, approxMs);
      const result = await fetchVendorData({
        vendorData: vendor,
        region: REGION,
        songData: { songId: "test", title, artist, duration: durationMs },
      });
      if (!("error" in result && result.error)) hits++;
      const label = `${title} — ${artist}`;
      console.log(`${pad(label, col)}  ${pad(fmt(itunesResult), vcol)}  ${pad(fmt(result), vcol)}`);
    } catch (e) {
      console.log(`${pad(`${song.title} — ${song.artist}`, col)}  ERROR: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log("─".repeat(col + vcol * 2 + 6));
  console.log(`\nHits: ${vendorKey} ${hits}/${SONGS.length}`);
}

// ── All-vendor run ────────────────────────────────────────────────────────────

async function runAllVendors() {
  const vendorsToShow = PRIMARY_VENDORS;
  const colLabel = 42;
  const colVendor = 20;
  const itunesCol = colVendor;

  console.log("\n=== Vendor test run ===");
  console.log(`Region: ${REGION}  |  Songs: ${SONGS.length}\n`);

  const header =
    `${"Song (title — artist)".padEnd(colLabel)}  ${"iTunes".padEnd(itunesCol)}  ` +
    vendorsToShow.map((v) => v.padEnd(colVendor)).join("  ");
  console.log(header);
  console.log("─".repeat(header.length));

  const hits: Record<string, number> = Object.fromEntries(
    ["itunes", ...vendorsToShow].map((v) => [v, 0]),
  );

  for (const song of SONGS) {
    try {
      const { title, artist, durationMs: approxMs } = song;
      const { durationMs, itunesResult } = await resolveItunes(title, artist, approxMs);
      if (!("error" in itunesResult && itunesResult.error)) hits["itunes"]!++;

      const results = await Promise.all(
        vendorsToShow.map((v) =>
          fetchVendorData({
            vendorData: VENDORS[v],
            region: REGION,
            songData: { songId: "test", title, artist, duration: durationMs },
          }),
        ),
      );

      results.forEach((r, i) => {
        if (!("error" in r && r.error)) hits[vendorsToShow[i]!]!++;
      });

      const label = `${title} — ${artist}`;
      const cells = results.map((r) => pad(fmt(r), colVendor)).join("  ");
      console.log(`${pad(label, colLabel)}  ${pad(fmt(itunesResult), itunesCol)}  ${cells}`);
    } catch (e) {
      console.log(`${pad(`${song.title} — ${song.artist}`, colLabel)}  ERROR: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log("─".repeat(header.length));
  const hitLine = ["itunes", ...vendorsToShow]
    .map((v) => `${v} ${hits[v]}/${SONGS.length}`)
    .join("  ");
  console.log(`\nHits: ${hitLine}`);
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
    const { durationMs } = await resolveItunes(title, artist, approxMs, "US");

    const results = await Promise.all(
      AMAZON_REGIONS.map((region) =>
        fetchVendorData({
          vendorData: VENDORS.amazon,
          region,
          songData: { songId: "test", title, artist, duration: durationMs },
        }),
      ),
    );

    const label = `${title} — ${artist}`;
    const cells = results.map((res, i) => {
      const r = AMAZON_REGIONS[i]!;
      if (!("error" in res && res.error)) hits[r]!++;
      return pad(fmt(res), regionCol);
    });
    console.log(`${pad(label, songCol)}  ${cells.join("  ")}`);

    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log("─".repeat(header.length));
  const hitLine = AMAZON_REGIONS.map((r) => `${r}: ${hits[r]}/${AMAZON_SWEEP_SONGS.length}`).join("  ");
  console.log(`\nHits  ${hitLine}`);
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  if (AMAZON_SWEEP) {
    await runAmazonSweep();
  } else if (SINGLE_VENDOR) {
    await runSingleVendor(SINGLE_VENDOR);
  } else {
    await runAllVendors();
  }
}

main().catch(console.error);
