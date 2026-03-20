import axios from "axios";
import * as cheerio from "cheerio";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function search(title: string, artist: string) {
  const q = encodeURIComponent(`${title} ${artist}`);
  const url = `https://bandcamp.com/search?q=${q}&item_type=t`;
  const r = await axios.get<string>(url, { headers: { "User-Agent": UA }, timeout: 10_000 });
  const $ = cheerio.load(r.data);
  console.log(`\n--- ${title} / ${artist} ---`);
  $("li.searchresult").slice(0, 3).each((i, el) => {
    const type = $(el).find(".itemtype").text().trim();
    const heading = $(el).find(".heading").text().trim();
    const subhead = $(el).find(".subhead").text().trim();
    const href = $(el).find(".heading a").attr("href")?.split("?")[0] ?? "";
    const subdomain = href ? new URL(href).hostname.replace(".bandcamp.com", "") : "N/A";
    console.log(`  [${i}] type="${type}" | "${heading}" | subhead="${subhead}"`);
    console.log(`       subdomain="${subdomain}"`);
  });
}

async function main() {
  await search("Archangel", "Burial");
  await search("Kiara", "Bonobo");
  await search("Glue", "Bicep");
  await search("Sing", "Four Tet");
  await search("Bad Kingdom", "Moderat");
  await search("LesAlpx", "Floating Points");
  await search("Says", "Nils Frahm");
}

main().catch(console.error);
