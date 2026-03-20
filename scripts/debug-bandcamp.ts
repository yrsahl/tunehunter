/**
 * Debug script for the Bandcamp scraper.
 * Run with: npx tsx scripts/debug-bandcamp.ts
 *
 * Uses the exact same matching logic as the production scraper so failures
 * here reproduce exactly what happens in the app.
 */

import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";

// ── Edit these to match the track you are debugging ──────────────────────────
// These should be the values as stored in the DB (from iTunes), not the raw
// user search string. Check the DB or console.log the scraper inputs.
const TITLE = "Stellar";
const ARTIST = ".diedlonely & énouement"; // joined artist string from DB
const DURATION_MS = 99_672;
// ─────────────────────────────────────────────────────────────────────────────

const SCRAPER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

// ── Matching helpers (mirrors api.ts exactly) ─────────────────────────────────
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function titleMatches(resultTitle: string, searchTitle: string): boolean {
  const searchTokens = tokenize(searchTitle);
  if (searchTokens.length === 0) return true;
  const resultSet = new Set(tokenize(resultTitle));
  const matched = searchTokens.filter((t) => resultSet.has(t)).length;
  const ratio = matched / searchTokens.length;
  console.log(
    `    titleMatches: "${resultTitle}" vs "${searchTitle}" → ${matched}/${searchTokens.length} = ${ratio.toFixed(2)} ${ratio >= 0.75 ? "✅" : "❌"}`,
  );
  return ratio >= 0.75;
}

function artistMatches(resultArtist: string, searchArtist: string): boolean {
  const resultNorm = resultArtist.toLowerCase().replace(/[^\w]/g, "");
  const tokens = tokenize(searchArtist);
  const match = tokens.some((t) => resultNorm.includes(t));
  console.log(
    `    artistMatches: subdomain="${resultNorm}" tokens=${JSON.stringify(tokens)} → ${match ? "✅" : "❌"}`,
  );
  return match;
}
// ─────────────────────────────────────────────────────────────────────────────

function parseBandcampDuration(raw: string): number | null {
  const m = raw.match(/P(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  return (
    (parseInt(m[1] ?? "0", 10) * 3600 +
      parseInt(m[2] ?? "0", 10) * 60 +
      parseInt(m[3] ?? "0", 10)) *
    1000
  );
}

async function main() {
  console.log("\n=== CONFIG ===");
  console.log(`  TITLE:       "${TITLE}"`);
  console.log(`  ARTIST:      "${ARTIST}"`);
  console.log(`  DURATION_MS: ${DURATION_MS}`);
  console.log(`  tokenize(TITLE):  ${JSON.stringify(tokenize(TITLE))}`);
  console.log(`  tokenize(ARTIST): ${JSON.stringify(tokenize(ARTIST))}`);

  const query = encodeURIComponent(`${TITLE} ${ARTIST}`);
  const searchUrl = `https://bandcamp.com/search?q=${query}&item_type=t`;

  console.log("\n=== STEP 1: Search ===");
  console.log("URL:", searchUrl);

  const response = await axios.get<string>(searchUrl, {
    headers: { "User-Agent": SCRAPER_UA },
    timeout: 15_000,
  });

  console.log("Status:", response.status);
  console.log("Response size:", response.data.length, "chars");
  fs.writeFileSync("scripts/bandcamp-search.html", response.data);
  console.log("Raw HTML saved to scripts/bandcamp-search.html");

  const $ = cheerio.load(response.data);
  const allItems = $("li.searchresult");
  console.log("\n=== STEP 2: Parse search results ===");
  console.log("Total li.searchresult elements:", allItems.length);

  const candidateUrls: string[] = [];
  allItems.each((i, el) => {
    const $el = $(el);
    const rawType = $el.find(".itemtype").text().trim().toUpperCase();
    const titleText = $el.find(".heading").text().trim();
    const artistText = $el.find(".subhead").text().trim();
    const rawHref = $el.find(".heading a").attr("href") ?? "";
    const url = rawHref.split("?")[0] ?? rawHref;
    console.log(`\n  [${i}] type="${rawType}"  title="${titleText}"`);
    console.log(`       subhead: "${artistText}"`);
    console.log(`       url:     ${url}`);
    if (rawType === "TRACK" && url) candidateUrls.push(url);
  });

  if (!candidateUrls.length) {
    console.log("\n❌ No TRACK candidates found — search returned no results.");
    console.log("   Check scripts/bandcamp-search.html for the raw response.");
    return;
  }

  console.log(`\n=== STEP 3: Fetch + check up to ${Math.min(candidateUrls.length, 3)} track pages ===`);

  let matched = false;
  for (let i = 0; i < Math.min(candidateUrls.length, 3); i++) {
    const url = candidateUrls[i]!;
    console.log(`\n  [${i}] ${url}`);

    // Artist check via subdomain
    const subdomain = new URL(url).hostname.replace(".bandcamp.com", "");
    const artistOk = artistMatches(subdomain, ARTIST);
    if (!artistOk) {
      console.log("    → SKIPPED (artist mismatch)");
      continue;
    }

    let trackResponse;
    try {
      trackResponse = await axios.get<string>(url, {
        headers: { "User-Agent": SCRAPER_UA },
        timeout: 15_000,
      });
    } catch (e) {
      console.log("    → SKIPPED (HTTP error:", e instanceof Error ? e.message : e, ")");
      continue;
    }

    const filename = `scripts/bandcamp-track-${i}.html`;
    fs.writeFileSync(filename, trackResponse.data);
    console.log(`    Saved to ${filename}`);

    const $t = cheerio.load(trackResponse.data);
    let durationMs: number | null = null;
    let trackTitle: string | null = null;
    let price: number | null = null;
    let currency: string | null = null;

    $t('script[type="application/ld+json"]').each((_, el) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json = JSON.parse($t(el).html() ?? "") as any;
        if (json.name) trackTitle = json.name as string;
        if (json.duration) durationMs = parseBandcampDuration(json.duration as string);
        const offers = json?.inAlbum?.albumRelease?.[0]?.offers;
        if (offers?.price != null) {
          price = offers.price as number;
          currency = (offers.priceCurrency as string | undefined) ?? null;
        }
      } catch { /* skip invalid JSON-LD */ }
    });

    console.log(`    JSON-LD title:    ${trackTitle ?? "❌ not found"}`);
    console.log(`    JSON-LD duration: ${durationMs != null ? `${durationMs}ms` : "❌ not found"}`);
    console.log(`    JSON-LD price:    ${price != null ? `${price} ${currency}` : "❌ not found"}`);

    if (durationMs === null) { console.log("    → SKIPPED (no duration)"); continue; }

    const titleOk = trackTitle ? titleMatches(trackTitle, TITLE) : true;
    if (!titleOk) { console.log("    → SKIPPED (title mismatch)"); continue; }

    const delta = Math.abs(durationMs - DURATION_MS);
    const durationOk = delta <= 2000;
    console.log(`    duration delta:   ${delta}ms ${durationOk ? "✅" : "❌ (> 2000ms threshold)"}`);
    if (!durationOk) { console.log("    → SKIPPED (duration mismatch)"); continue; }

    console.log("    → ✅ MATCH");
    console.log("       URL:  ", url);
    console.log("       Price:", price, currency);
    matched = true;
    break;
  }

  console.log("\n=== STEP 4: Result ===");
  console.log(matched ? "✅ Match found!" : "❌ NO_MATCH_FOUND");
}

main().catch(console.error);
