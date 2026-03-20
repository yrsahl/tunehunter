/**
 * Targeted trace for Bicep — Glue on Bandcamp.
 * Run: npx tsx scripts/debug-bandcamp-glue.ts
 */
import axios from "axios";
import * as cheerio from "cheerio";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
const DURATION_MS = 392_000;

function tokenize(text: string) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((t) => t.length > 1);
}
function artistMatches(resultArtist: string, searchArtist: string) {
  const norm = resultArtist.toLowerCase().replace(/[^\w]/g, "");
  return tokenize(searchArtist).some((t) => norm.includes(t));
}
function parseDuration(raw: string): number | null {
  const m = raw.match(/P(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  return (parseInt(m[1] ?? "0") * 3600 + parseInt(m[2] ?? "0") * 60 + parseInt(m[3] ?? "0")) * 1000;
}

async function main() {
  const q = encodeURIComponent("Glue Bicep");
  const searchUrl = `https://bandcamp.com/search?q=${q}&item_type=t`;
  console.log("Search URL:", searchUrl);

  const r = await axios.get<string>(searchUrl, { headers: { "User-Agent": UA }, timeout: 10_000 });
  const $ = cheerio.load(r.data);
  const items = $("li.searchresult");
  console.log("Results:", items.length);

  const urls: string[] = [];
  items.each((i, el) => {
    const type = $(el).find(".itemtype").text().trim();
    const href = $(el).find(".heading a").attr("href")?.split("?")[0] ?? "";
    const subhead = $(el).find(".subhead").text().trim();
    console.log(`  [${i}] type="${type}" subhead="${subhead}" url=${href}`);
    if (type.toUpperCase() === "TRACK" && href) urls.push(href);
  });

  console.log("\nChecking up to 3 track pages...");
  for (const url of urls.slice(0, 3)) {
    const subdomain = new URL(url).hostname.replace(".bandcamp.com", "");
    const artistOk = artistMatches(subdomain, "Bicep");
    console.log(`\n  URL: ${url}`);
    console.log(`  subdomain="${subdomain}" artistOk=${artistOk}`);
    if (!artistOk) { console.log("  → SKIP (artist)"); continue; }

    const tr = await axios.get<string>(url, { headers: { "User-Agent": UA }, timeout: 10_000 });
    const $t = cheerio.load(tr.data);
    let durationMs: number | null = null;
    let title: string | null = null;
    let price: number | null = null;
    let currency: string | null = null;

    $t('script[type="application/ld+json"]').each((_, el) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json = JSON.parse($t(el).html() ?? "") as any;
        console.log("  JSON-LD keys:", Object.keys(json));
        if (json.name) title = json.name as string;
        if (json.duration) durationMs = parseDuration(json.duration as string);
        const offers = json?.inAlbum?.albumRelease?.[0]?.offers;
        console.log("  offers path:", JSON.stringify(offers));
        if (offers?.price != null) { price = offers.price as number; currency = offers.priceCurrency as string; }
      } catch (e) { console.log("  JSON-LD parse error:", e); }
    });

    console.log(`  title="${title}" duration=${durationMs}ms delta=${durationMs != null ? Math.abs(durationMs - DURATION_MS) : "N/A"}ms price=${price} ${currency}`);
  }
}

main().catch(console.error);
