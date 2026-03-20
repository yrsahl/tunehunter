/**
 * Debug script for the Bandcamp scraper.
 * Run with: npx tsx scripts/debug-bandcamp.ts
 *
 * Tweak TITLE / ARTIST / DURATION_MS to match any track you want to test.
 */

import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";

const TITLE = "stellar";
const ARTIST = ".diedlonely";
const DURATION_MS = 99_000; // milliseconds

const SCRAPER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

/** Parse Bandcamp's ISO-ish duration string e.g. "P00H01M39S" → milliseconds */
function parseBandcampDuration(raw: string): number | null {
  const m = raw.match(/P(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] ?? "0", 10);
  const min = parseInt(m[2] ?? "0", 10);
  const sec = parseInt(m[3] ?? "0", 10);
  return (h * 3600 + min * 60 + sec) * 1000;
}

interface TrackPageData {
  durationMs: number | null;
  price: number | null;
  currency: string | null;
}

async function fetchTrackPage(url: string, index: number): Promise<TrackPageData> {
  console.log(`\n  → Fetching track page [${index}]: ${url}`);
  const response = await axios.get<string>(url, {
    headers: { "User-Agent": SCRAPER_UA },
    timeout: 15_000,
  });

  const filename = `scripts/bandcamp-track-${index}.html`;
  fs.writeFileSync(filename, response.data);
  console.log(`    Saved to ${filename} (${response.data.length} chars)`);

  const $ = cheerio.load(response.data);

  // JSON-LD is the most reliable source of structured data
  let durationMs: number | null = null;
  let price: number | null = null;
  let currency: string | null = null;

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() ?? "");
      // Duration lives at top level
      if (json.duration) {
        durationMs = parseBandcampDuration(json.duration as string);
        console.log(`    duration (JSON-LD): "${json.duration as string}" → ${durationMs}ms`);
      }
      // Price lives inside inAlbum.albumRelease[0].offers
      const offers = json?.inAlbum?.albumRelease?.[0]?.offers;
      if (offers?.price != null) {
        price = offers.price as number;
        currency = (offers.priceCurrency as string | undefined) ?? null;
        console.log(`    price (JSON-LD):    ${price} ${currency}`);
      }
    } catch {
      // not valid JSON, skip
    }
  });

  if (durationMs === null) {
    console.log("    duration: ❌ NOT FOUND in JSON-LD");
  }
  if (price === null) {
    console.log("    price: ❌ NOT FOUND in JSON-LD");
  }

  return { durationMs, price, currency };
}

async function main() {
  const query = encodeURIComponent(`${TITLE} ${ARTIST}`);
  const searchUrl = `https://bandcamp.com/search?q=${query}&item_type=t`;

  console.log("\n=== STEP 1: Search ===");
  console.log("URL:", searchUrl);

  const response = await axios.get<string>(searchUrl, {
    headers: { "User-Agent": SCRAPER_UA },
    timeout: 15_000,
  });

  console.log("Status:", response.status);
  console.log("Content-Type:", response.headers["content-type"]);
  console.log("Response size:", response.data.length, "chars");
  fs.writeFileSync("scripts/bandcamp-search.html", response.data);
  console.log("Raw HTML saved to scripts/bandcamp-search.html");

  const $ = cheerio.load(response.data);

  console.log("\n=== STEP 2: Parse search results ===");

  // Bandcamp's current class is "searchresult data-search" (not "searchresult track")
  const allItems = $("li.searchresult");
  console.log("Total li.searchresult elements:", allItems.length);

  const candidateUrls: string[] = [];

  allItems.each((i, el) => {
    const $el = $(el);
    const rawType = $el.find(".itemtype").text().trim().toUpperCase();
    const titleText = $el.find(".heading").text().trim();
    const artistText = $el.find(".subhead").text().trim();
    // Strip tracking params from URL
    const rawHref = $el.find(".heading a").attr("href") ?? "";
    const url = rawHref.split("?")[0] ?? rawHref;

    console.log(`\n  [${i}] type="${rawType}"  title="${titleText}"`);
    console.log(`       artist: ${artistText}`);
    console.log(`       url:    ${url}`);

    // Only consider tracks (type TRACK in the itemtype div)
    if (rawType === "TRACK" && url) {
      candidateUrls.push(url);
    }
  });

  if (!candidateUrls.length) {
    console.log("\n❌ No TRACK candidates found. Check bandcamp-search.html.");
    return;
  }

  console.log(`\n=== STEP 3: Fetch top ${Math.min(candidateUrls.length, 3)} track pages ===`);

  const MAX_CANDIDATES = 3;
  let bestUrl: string | null = null;
  let bestPrice: number | null = null;
  let bestCurrency: string | null = null;
  let bestDelta = Infinity;

  for (let i = 0; i < Math.min(candidateUrls.length, MAX_CANDIDATES); i++) {
    const url = candidateUrls[i]!;
    const { durationMs, price, currency } = await fetchTrackPage(url, i);

    if (durationMs === null) continue;
    const delta = Math.abs(durationMs - DURATION_MS);
    console.log(`    duration delta: ${delta}ms ${delta <= 2000 ? "✅" : "❌"}`);

    if (delta < bestDelta) {
      bestDelta = delta;
      bestUrl = url;
      bestPrice = price;
      bestCurrency = currency;
    }
  }

  console.log("\n=== STEP 4: Result ===");
  if (!bestUrl || bestDelta > 2000) {
    console.log(`❌ NO_MATCH_FOUND (best delta: ${bestDelta}ms, threshold: 2000ms)`);
    return;
  }

  console.log("✅ Match found!");
  console.log("   URL:      ", bestUrl);
  console.log("   Price:    ", bestPrice, bestCurrency);
  console.log("   Delta:    ", bestDelta, "ms");
}

main().catch(console.error);
