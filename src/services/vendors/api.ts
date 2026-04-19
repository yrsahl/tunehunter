import { NewSongListing } from "@/server/api/schemas/song-listings-schemas";
import type { SongVendorType } from "@/server/db/schema";
import { ITunesData } from "@/types/itunes-types";
import axios from "axios";
import * as cheerio from "cheerio";
import { createHash, createHmac } from "crypto";
import { filterListings } from ".";

const SCRAPER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

// Maps country code → Accept-Language header value so scrapers request
// region-correct pricing/currency from vendor sites.
const REGION_ACCEPT_LANGUAGE: Record<string, string> = {
  US: "en-US,en;q=0.9",
  GB: "en-GB,en;q=0.9",
  DE: "de-DE,de;q=0.9",
  FR: "fr-FR,fr;q=0.9",
  ES: "es-ES,es;q=0.9",
  IT: "it-IT,it;q=0.9",
  JP: "ja-JP,ja;q=0.9",
  CA: "en-CA,en;q=0.9",
  AU: "en-AU,en;q=0.9",
  MX: "es-MX,es;q=0.9",
  BR: "pt-BR,pt;q=0.9",
  IN: "en-IN,en;q=0.9",
  NL: "nl-NL,nl;q=0.9",
  SE: "sv-SE,sv;q=0.9",
  PL: "pl-PL,pl;q=0.9",
  TR: "tr-TR,tr;q=0.9",
  SG: "en-SG,en;q=0.9",
  AE: "ar-AE,ar;q=0.9",
  SA: "ar-SA,ar;q=0.9",
};

const getAcceptLanguage = (region: string) =>
  REGION_ACCEPT_LANGUAGE[region.toUpperCase()] ?? "en-US,en;q=0.9";

// Interfaces
interface VendorDataSuccessResponse {
  data: NewSongListing;
  error?: undefined;
}
interface VendorDataErrorResponse {
  error: VendorDataError;
  data?: undefined;
}
export type VendorDataError = "VENDOR_NOT_SUPPORTED" | "NO_MATCH_FOUND";
export type VendorDataResponse = VendorDataSuccessResponse | VendorDataErrorResponse;

interface IFetchVendorData {
  region: string;
  vendorData: { vendorId: number; store: SongVendorType };
  songData: {
    songId: string;
    title: string;
    artist: string;
    duration: number;
  };
  signal?: AbortSignal;
}

// --- Matching helpers ---

/** Lowercase, strip punctuation, split into tokens longer than 1 char. */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Returns true if ≥75% of the search title's tokens appear in the result title.
 * Allows "Stellar" to match "Stellar (Original Mix)" while still blocking
 * completely unrelated titles.
 */
function titleMatches(resultTitle: string, searchTitle: string): boolean {
  const searchTokens = tokenize(searchTitle);
  if (searchTokens.length === 0) return true;
  const resultSet = new Set(tokenize(resultTitle));
  const matched = searchTokens.filter((t) => resultSet.has(t)).length;
  return matched / searchTokens.length >= 0.75;
}

/**
 * Returns true if at least one token from searchArtist appears as a substring
 * of resultArtist. Handles minor spelling differences (e.g. "diedlonely" in
 * "diedlonelyy") and multi-artist strings.
 */
function artistMatches(resultArtist: string, searchArtist: string): boolean {
  const resultNorm = resultArtist.toLowerCase().replace(/[^\w]/g, "");
  return tokenize(searchArtist).some((t) => resultNorm.includes(t));
}

export const fetchVendorData = async ({
  vendorData,
  region,
  songData,
  signal,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const args = { region, vendorData, songData, signal };
  if (vendorData.store === "itunes")      return await fetchItunesData(args);
  if (vendorData.store === "beatport")    return await fetchBeatportData(args);
  if (vendorData.store === "bandcamp")    return await fetchBandcampData(args);
  if (vendorData.store === "amazon")      return await fetchAmazonData(args);
  if (vendorData.store === "traxsource")  return await fetchTraxsourceData(args);
  if (vendorData.store === "junodownload")return await fetchJunodownloadData(args);
  if (vendorData.store === "qobuz")       return await fetchQobuzData(args);
  if (vendorData.store === "hdtracks")    return await fetchHdtracksData(args);
  if (vendorData.store === "sevendigital")return await fetchSevendigitalData(args);

  return { error: "VENDOR_NOT_SUPPORTED" };
};

// iTunes
const fetchItunesData = async ({
  region,
  vendorData,
  songData,
  signal,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  // Query the iTunes Music API
  const dataUrl = new URL(
    `https://itunes.apple.com/search?country=${region}&media=music&entity=song&limit=5&term=${title}+${artist}`,
  ).href;
  const response = await axios.get<ITunesData>(dataUrl, { signal });

  // 2. Extract data
  // Replace the country segment in the Apple Music URL (e.g. /de/ → /fr/) to ensure
  // the link targets the correct regional storefront regardless of server locale.
  const regionLower = region.toLowerCase();
  const toRegionalUrl = (url: string) =>
    url.replace(/music\.apple\.com\/[a-z]{2}\//, `music.apple.com/${regionLower}/`);

  const itunesListings: NewSongListing[] = response.data.results.map((song) => ({
    songId,
    vendorId,
    url: toRegionalUrl(song.trackViewUrl),
    duration: song.trackTimeMillis,
    price: song.trackPrice != null ? parseFloat(song.trackPrice.toString()).toFixed(2) : undefined,
    currency: song.currency,
    region,
  }));

  // 3. Find the best match by closest duration
  const filteredItunesListing = filterListings(itunesListings, duration);

  // If we got a match, return it
  if (filteredItunesListing !== undefined) {
    return { data: filteredItunesListing };
  }

  // Return empty object if no match found
  return {
    error: "NO_MATCH_FOUND",
  };
};

// Amazon Product Advertising API 5.0
// Credentials are optional — returns NO_MATCH_FOUND until they are configured.
// Set in .env: AMAZON_PA_ACCESS_KEY, AMAZON_PA_SECRET_KEY, AMAZON_PA_TAG_<REGION>

interface PaapiMarketplaceConfig {
  host: string;
  awsRegion: string;
  marketplace: string;
}

const PAAPI_MARKETPLACES: Record<string, PaapiMarketplaceConfig> = {
  GB: { host: "webservices.amazon.co.uk", awsRegion: "eu-west-1", marketplace: "www.amazon.co.uk" },
  US: { host: "webservices.amazon.com",    awsRegion: "us-east-1", marketplace: "www.amazon.com" },
  DE: { host: "webservices.amazon.de",     awsRegion: "eu-west-1", marketplace: "www.amazon.de" },
  FR: { host: "webservices.amazon.fr",     awsRegion: "eu-west-1", marketplace: "www.amazon.fr" },
  ES: { host: "webservices.amazon.es",     awsRegion: "eu-west-1", marketplace: "www.amazon.es" },
  IT: { host: "webservices.amazon.it",     awsRegion: "eu-west-1", marketplace: "www.amazon.it" },
  JP: { host: "webservices.amazon.co.jp",  awsRegion: "us-west-2", marketplace: "www.amazon.co.jp" },
  CA: { host: "webservices.amazon.ca",     awsRegion: "us-east-1", marketplace: "www.amazon.ca" },
  AU: { host: "webservices.amazon.com.au", awsRegion: "us-west-2", marketplace: "www.amazon.com.au" },
};

// Maps region code to the env var holding its associate tag
const PAAPI_TAG_ENV: Record<string, string> = {
  GB: "AMAZON_PA_TAG_GB",
  US: "AMAZON_PA_TAG_US",
  DE: "AMAZON_PA_TAG_DE",
  FR: "AMAZON_PA_TAG_FR",
  ES: "AMAZON_PA_TAG_ES",
  IT: "AMAZON_PA_TAG_IT",
  JP: "AMAZON_PA_TAG_JP",
  CA: "AMAZON_PA_TAG_CA",
  AU: "AMAZON_PA_TAG_AU",
};

const PAAPI_PATH = "/paapi5/searchitems";
const PAAPI_TARGET = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems";
const PAAPI_SERVICE = "ProductAdvertisingAPI";

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}
function sha256hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}
function getSigningKey(secretKey: string, dateStamp: string, awsRegion: string): Buffer {
  return hmac(hmac(hmac(hmac(`AWS4${secretKey}`, dateStamp), awsRegion), PAAPI_SERVICE), "aws4_request");
}

// ── Amazon scraper (active) ───────────────────────────────────────────────────
// Scrapes the digital-music search page using the `i=digital-music` search index.
// Individual track cards are identified by `trackAsin=` in their buy link.
//
// Region support:
//   ✅ US, DE, FR, ES, IT  — digital music store present, scraping works
//   ❌ GB                  — WAF JavaScript challenge blocks scraping
//   ❌ CA, AU              — no digital music download store (i=digital-music
//                            returns physical CDs / unrelated items, no trackAsin links)
//
// GB / CA / AU will return NO_MATCH_FOUND until PA API credentials are available.
// Switch to fetchAmazonDataPaapi once AMAZON_PA_ACCESS_KEY + AMAZON_PA_SECRET_KEY are set.

const AMAZON_SCRAPE_DOMAIN: Record<string, string> = {
  US: "amazon.com",
  DE: "amazon.de",
  FR: "amazon.fr",
  ES: "amazon.es",
  IT: "amazon.it",
  // GB: WAF blocked. CA/AU: no digital music store.
};

const AMAZON_CURRENCY: Record<string, string> = {
  US: "USD",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
};

const fetchAmazonData = async ({
  region,
  vendorData,
  songData,
  signal,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;
  const regionUpper = region.toUpperCase();
  const domain = AMAZON_SCRAPE_DOMAIN[regionUpper];
  const currency = AMAZON_CURRENCY[regionUpper] ?? "USD";
  if (!domain) return { error: "NO_MATCH_FOUND" };

  const query = encodeURIComponent(`${title} ${artist}`);
  const searchUrl = `https://www.${domain}/s?k=${query}&i=digital-music`;

  let response;
  try {
    response = await axios.get<string>(searchUrl, {
      headers: {
        "User-Agent": SCRAPER_UA,
        "Accept-Language": getAcceptLanguage(region),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "identity",
      },
      signal,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    return { error: "NO_MATCH_FOUND" };
  }

  // WAF JavaScript challenge — scraping is blocked for this region
  if ((response.data as string).includes("awsWafCookieDomainList")) {
    return { error: "NO_MATCH_FOUND" };
  }

  const $ = cheerio.load(response.data as string);
  let result: VendorDataResponse = { error: "NO_MATCH_FOUND" };

  $('[data-component-type="s-search-result"]').each((_, el) => {
    if (result.data) return; // already found a match

    const $el = $(el);
    const asin = $el.attr("data-asin");
    if (!asin) return;

    // Cards for individual tracks have `trackAsin=` in their link href.
    // Album cards do not — skip them.
    if (!$el.find('a[href*="trackAsin="]').length) return;

    // Title is in h2 > span
    const cardTitle = $el.find("h2 span").first().text().trim();
    if (!titleMatches(cardTitle, title)) return;

    // Artist is the last span.a-size-base inside the first .a-color-secondary div
    // (the first span in that div is the localised "by"/"von"/"de" label)
    const cardArtist = $el.find(".a-color-secondary").first().find(".a-size-base").last().text().trim();
    if (!artistMatches(cardArtist, artist)) return;

    // Price text: "Oder 1,29 €, …" / "$1.29 to buy" / "£1.29" etc.
    // Try the data-cy attribute first (may change across Amazon redesigns), then
    // the stable accessible price span (.a-price .a-offscreen) as fallback.
    const priceText =
      $el.find('[data-cy="secondary-offer-recipe"] span').text().trim() ||
      $el.find(".a-price .a-offscreen").first().text().trim();
    const priceMatch = priceText.match(/(\d+)[,.](\d{2})/);
    if (!priceMatch) return;
    const price = `${priceMatch[1]}.${priceMatch[2]}`;

    result = {
      data: {
        songId,
        vendorId,
        url: `https://www.${domain}/dp/${asin}`,
        duration,
        price,
        currency,
        region,
      } satisfies NewSongListing,
    };
  });

  return result;
};

// ── Amazon Product Advertising API 5.0 (kept for when credentials arrive) ────
// To activate: rename this to fetchAmazonData and remove the scraper above.
// Set in .env: AMAZON_PA_ACCESS_KEY, AMAZON_PA_SECRET_KEY, AMAZON_PA_TAG_<REGION>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fetchAmazonDataPaapi = async ({
  region,
  vendorData,
  songData,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const accessKey = process.env.AMAZON_PA_ACCESS_KEY;
  const secretKey = process.env.AMAZON_PA_SECRET_KEY;
  const regionUpper = region.toUpperCase();
  const tagEnvKey = PAAPI_TAG_ENV[regionUpper];
  const tag = tagEnvKey ? process.env[tagEnvKey] : undefined;
  const config = PAAPI_MARKETPLACES[regionUpper];

  if (!accessKey || !secretKey || !tag || !config) return { error: "NO_MATCH_FOUND" };

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const payload = JSON.stringify({
    Keywords: `${title} ${artist}`,
    SearchIndex: "Music",
    Resources: ["ItemInfo.Title", "Offers.Listings.Price"],
    PartnerTag: tag,
    PartnerType: "Associates",
    Marketplace: config.marketplace,
    ItemCount: 5,
  });

  const reqHeaders: Record<string, string> = {
    "content-encoding": "amz-1.0",
    "content-type": "application/json; charset=utf-8",
    "host": config.host,
    "x-amz-date": amzDate,
    "x-amz-target": PAAPI_TARGET,
  };
  const sortedHeaderKeys = Object.keys(reqHeaders).sort();
  const canonicalHeaders = `${sortedHeaderKeys.map((k) => `${k}:${reqHeaders[k]}`).join("\n")}\n`;
  const signedHeaders = sortedHeaderKeys.join(";");

  const canonicalRequest = ["POST", PAAPI_PATH, "", canonicalHeaders, signedHeaders, sha256hex(payload)].join("\n");
  const credentialScope = `${dateStamp}/${config.awsRegion}/${PAAPI_SERVICE}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256hex(canonicalRequest)].join("\n");
  const signature = hmac(getSigningKey(secretKey, dateStamp, config.awsRegion), stringToSign).toString("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await axios.post<{
    SearchResult?: { Items?: { DetailPageURL: string; Offers?: { Listings?: { Price?: { Amount?: number; Currency?: string } }[] } }[] };
  }>(
    `https://${config.host}${PAAPI_PATH}`,
    payload,
    { headers: { ...reqHeaders, Authorization: authorization }, timeout: 10_000 },
  );

  const items = response.data?.SearchResult?.Items ?? [];
  for (const item of items) {
    const listing = item?.Offers?.Listings?.[0];
    if (!listing?.Price?.Amount) continue;

    return {
      data: {
        songId,
        vendorId,
        url: item.DetailPageURL,
        duration,
        price: parseFloat(listing.Price.Amount.toString()).toFixed(2),
        currency: listing.Price.Currency ?? "USD",
        region,
      },
    };
  }

  return { error: "NO_MATCH_FOUND" };
};

// Beatport - Next.js app; all track data (duration, price, id) is embedded in __NEXT_DATA__
// on the search page, so no second request is needed.

/** Return first matching string value across a list of candidate field names. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bpStr(obj: any, ...keys: string[]): string | undefined {
  for (const k of keys) {
    if (typeof obj[k] === "string" && (obj[k] as string).length > 0) return obj[k] as string;
  }
  return undefined;
}

/** Return first matching number value across a list of candidate field names. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bpNum(obj: any, ...keys: string[]): number | undefined {
  for (const k of keys) {
    if (typeof obj[k] === "number") return obj[k] as number;
  }
  return undefined;
}

/**
 * Walk the dehydrated React Query cache and return the first non-empty track array.
 * Tries several known data shapes so that minor Beatport restructurings don't break the scraper.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractBeatportTracks(nextData: any): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queries: any[] = nextData?.props?.pageProps?.dehydratedState?.queries ?? [];
  for (const q of queries) {
    // Primary shape (current): { tracks: { data: [...] } }
    const v1 = q?.state?.data?.tracks?.data;
    if (Array.isArray(v1) && v1.length > 0) return v1 as unknown[];
    // Fallback: wrapper removed → { data: [...] }
    const v2 = q?.state?.data?.data;
    if (Array.isArray(v2) && v2.length > 0) return v2 as unknown[];
    // Fallback: renamed to results → { results: [...] }
    const v3 = q?.state?.data?.results;
    if (Array.isArray(v3) && v3.length > 0) return v3 as unknown[];
    // Fallback: state.data is directly the array
    const v4 = q?.state?.data;
    if (Array.isArray(v4) && v4.length > 0) return v4 as unknown[];
  }
  return [];
}

const fetchBeatportData = async ({
  region,
  vendorData,
  songData,
  signal,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const query = encodeURIComponent(`${title} ${artist}`);
  const searchUrl = `https://www.beatport.com/search?q=${query}`;

  let html: string;
  try {
    const response = await axios.get<string>(searchUrl, {
      headers: { "User-Agent": SCRAPER_UA, "Accept-Language": getAcceptLanguage(region) },
      signal,
    });
    html = response.data;
  } catch (err) {
    if (signal?.aborted) throw err;
    return { error: "NO_MATCH_FOUND" };
  }

  const $ = cheerio.load(html);
  const nextDataText = $("#__NEXT_DATA__").text();
  if (!nextDataText) return { error: "NO_MATCH_FOUND" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let nextData: any;
  try {
    nextData = JSON.parse(nextDataText);
  } catch {
    return { error: "NO_MATCH_FOUND" };
  }

  const tracks = extractBeatportTracks(nextData);
  if (!tracks.length) return { error: "NO_MATCH_FOUND" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listings: NewSongListing[] = (tracks as any[])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((t: any) => {
      // Must have a duration field to do duration-based matching
      if (bpNum(t, "length", "duration", "length_ms", "lengthMs", "duration_ms") === undefined) return false;
      const resultTitle = [
        bpStr(t, "track_name", "name", "title"),
        bpStr(t, "mix_name", "mix", "mixName"),
      ].filter(Boolean).join(" ");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultArtist = (t.artists as { artist_name?: string; name?: string }[] | undefined)
        ?.map((a) => a.artist_name ?? a.name ?? "").join(" ") ?? "";
      return titleMatches(resultTitle, title) && artistMatches(resultArtist, artist);
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((t: any) => {
      const len = bpNum(t, "length", "duration", "length_ms", "lengthMs", "duration_ms")!;
      const trackName = bpStr(t, "track_name", "name", "title") ?? "";
      const mixName = bpStr(t, "mix_name", "mix", "mixName");
      const trackId = bpNum(t, "track_id", "id") ?? bpStr(t, "track_id", "id");

      // Prefer a pre-built slug in the data; fall back to constructing one
      const slug = bpStr(t, "slug") ?? [trackName, mixName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const url = `https://www.beatport.com/track/${slug}/${trackId ?? ""}`.replace(/\/$/, "");

      // Price is optional — support multiple known field shapes, store null if unavailable
      const priceValue = t?.price?.value ?? t?.price?.amount ?? t?.purchase_price;
      const priceCurrency = t?.price?.code ?? t?.price?.currency ?? t?.currency;

      return {
        songId,
        vendorId,
        url,
        duration: len,
        price: priceValue != null ? (priceValue as number).toFixed(2) : undefined,
        currency: (typeof priceCurrency === "string" ? priceCurrency : "USD").toUpperCase(),
        region,
      } satisfies NewSongListing;
    });

  const match = filterListings(listings, duration);
  if (match) return { data: match };
  return { error: "NO_MATCH_FOUND" };
};

// Bandcamp - One base price for many formats (MP3 V0, MP3 320, FLAC, AAC, Ogg Vorbis, ALAC, WAV, AIFF)
// Step 1: search to collect candidate track page URLs (duration is not on the search page)
// Step 2: fetch each track page and parse JSON-LD for duration + price
// Step 3: return the candidate whose duration is closest to the input

/** Parse Bandcamp's duration string e.g. "P00H01M39S" → milliseconds */
const parseBandcampDuration = (raw: string): number | null => {
  const m = raw.match(/P(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  const h = parseInt(m[1] ?? "0", 10);
  const min = parseInt(m[2] ?? "0", 10);
  const sec = parseInt(m[3] ?? "0", 10);
  return (h * 3600 + min * 60 + sec) * 1000;
};

const fetchBandcampData = async ({
  region,
  vendorData,
  songData,
  signal,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const query = encodeURIComponent(`${title} ${artist}`);
  const searchUrl = `https://bandcamp.com/search?q=${query}&item_type=t`;

  // No Accept-Language here — Bandcamp localises the .itemtype text (e.g. "TITEL" in German)
  // which would break the "TRACK" filter. Price is read from the track page instead.
  const searchResponse = await axios.get<string>(searchUrl, {
    headers: { "User-Agent": SCRAPER_UA },
    signal,
  });

  const $ = cheerio.load(searchResponse.data);

  // Collect track page URLs. Bandcamp's class is "searchresult data-search";
  // filter by the .itemtype div text to ensure we only pick tracks.
  const candidateUrls: string[] = [];
  $("li.searchresult").each((_, el) => {
    const $el = $(el);
    if ($el.find(".itemtype").text().trim().toUpperCase() !== "TRACK") return;
    const rawHref = $el.find(".heading a").attr("href");
    if (!rawHref) return;
    // Strip search tracking params
    const url = rawHref.split("?")[0] ?? rawHref;
    candidateUrls.push(url);
  });

  if (!candidateUrls.length) return { error: "NO_MATCH_FOUND" };

  // Fetch up to 3 candidate pages in parallel and pick the best duration match
  const MAX_CANDIDATES = 3;
  let bestUrl: string | null = null;
  let bestPrice: string | null = null;
  let bestCurrency = "USD";
  let bestDurationMs = 0;
  let bestDelta = Infinity;

  const fetchResults = await Promise.allSettled(
    candidateUrls.slice(0, MAX_CANDIDATES).map(async (url) => {
      const res = await axios.get<string>(url, {
        headers: { "User-Agent": SCRAPER_UA, "Accept-Language": getAcceptLanguage(region) },
        signal,
      });
      return { url, html: res.data };
    }),
  );

  // If the abort signal fired during the candidate fetches, re-throw so the router
  // records STORE_UNREACHABLE rather than caching a spurious miss.
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  for (const result of fetchResults) {
    if (result.status === "rejected") continue;
    const { url, html } = result.value;

    // Artist check: extract from subdomain (e.g. "diedlonelyy" from diedlonelyy.bandcamp.com)
    const subdomain = new URL(url).hostname.replace(".bandcamp.com", "");
    if (!artistMatches(subdomain, artist)) continue;

    const $track = cheerio.load(html);
    let durationMs: number | null = null;
    let trackTitle: string | null = null;
    let price: string | null = null;
    let currency = "USD";

    $track('script[type="application/ld+json"]').each((_, el) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json = JSON.parse($track(el).html() ?? "") as any;
        if (json.name) trackTitle = json.name as string;
        if (json.duration) durationMs = parseBandcampDuration(json.duration as string);
        // Standalone singles expose offers directly; album tracks nest it under albumRelease.
        // Scan all albumRelease entries because [0] is not guaranteed to carry offers.
        const releaseOffers =
          (json?.inAlbum?.albumRelease as { offers?: { price?: number; priceCurrency?: string } }[] | undefined)
            ?.map((r) => r.offers)
            .find((o) => o?.price != null) ?? null;
        const offers = releaseOffers ?? (json?.offers as { price?: number; priceCurrency?: string } | undefined) ?? null;
        if (offers?.price != null) {
          price = (offers.price as number).toFixed(2);
          currency = ((offers.priceCurrency as string | undefined) ?? "USD").toUpperCase();
        }
      } catch {
        // not valid JSON-LD, skip
      }
    });

    if (durationMs === null) continue;
    if (trackTitle && !titleMatches(trackTitle, title)) continue;
    const delta = Math.abs(durationMs - duration);
    if (delta < bestDelta) {
      bestDelta = delta;
      bestUrl = url;
      bestPrice = price;
      bestCurrency = currency;
      bestDurationMs = durationMs;
    }
  }

  if (!bestUrl || bestDelta > 2000) return { error: "NO_MATCH_FOUND" };

  return {
    data: {
      songId,
      vendorId,
      url: bestUrl,
      duration: bestDurationMs,
      price: bestPrice,
      currency: bestCurrency,
      region,
    } satisfies NewSongListing,
  };
};

// ── Shared helpers for duration-text scrapers ─────────────────────────────────

/** Parse "M:SS" or "H:MM:SS" duration text to milliseconds. */
function parseMMSS(text: string): number | null {
  const parts = text.trim().split(":").map(Number);
  if (parts.length < 2 || parts.some(isNaN)) return null;
  if (parts.length === 2) return (parts[0]! * 60 + parts[1]!) * 1000;
  return (parts[0]! * 3600 + parts[1]! * 60 + parts[2]!) * 1000;
}

// ── Traxsource ────────────────────────────────────────────────────────────────
// Traxsource is a server-side rendered electronic music store.
// Search is filtered to tracks via `cn=tracks`; each .trax-row holds title,
// artists, duration (.time in M:SS), and price.

const fetchTraxsourceData = async ({
  region,
  vendorData,
  songData,
  signal,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const query = encodeURIComponent(`${title} ${artist}`);
  const searchUrl = `https://www.traxsource.com/search?term=${query}&cn=tracks&ipp=25`;

  let html: string;
  try {
    const response = await axios.get<string>(searchUrl, {
      headers: { "User-Agent": SCRAPER_UA, "Accept-Language": getAcceptLanguage(region) },
      signal,
    });
    html = response.data;
  } catch (err) {
    if (signal?.aborted) throw err;
    return { error: "NO_MATCH_FOUND" };
  }

  const $ = cheerio.load(html);
  const listings: NewSongListing[] = [];

  $(".trax-row").each((_, el) => {
    const $el = $(el);

    const cardTitle = $el.find(".title a, .col-title a").first().text().trim();
    if (!cardTitle || !titleMatches(cardTitle, title)) return;

    const cardArtist = $el.find(".artists a, .col-artists a").first().text().trim();
    if (!cardArtist || !artistMatches(cardArtist, artist)) return;

    const durationText = $el.find(".time, .col-time .time, .duration").first().text().trim();
    const durationMs = parseMMSS(durationText);
    if (!durationMs) return;

    const priceText = $el.find(".price, .trax-price, .buy-price, [class*='price']").first().text().trim();
    const priceMatch = priceText.match(/(\d+)[.,](\d{2})/);
    const price = priceMatch ? `${priceMatch[1]}.${priceMatch[2]}` : undefined;
    const currency = priceText.includes("€") ? "EUR" : priceText.includes("£") ? "GBP" : "USD";

    const trackHref = $el.find(".title a, .col-title a").first().attr("href") ?? "";
    if (!trackHref) return;
    const url = trackHref.startsWith("http") ? trackHref : `https://www.traxsource.com${trackHref}`;

    listings.push({ songId, vendorId, url, duration: durationMs, price, currency, region } satisfies NewSongListing);
  });

  const match = filterListings(listings, duration);
  if (match) return { data: match };
  return { error: "NO_MATCH_FOUND" };
};

// ── Juno Download ─────────────────────────────────────────────────────────────
// Juno Download is a server-side rendered electronic music store.
// Search returns release cards that each contain a tracklist; the scraper
// scans all track rows across all cards for a title + duration match.
// Artist match is done against the release-level artist name.

const fetchJunodownloadData = async ({
  region,
  vendorData,
  songData,
  signal,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const query = encodeURIComponent(`${title} ${artist}`);
  const searchUrl =
    `https://www.junodownload.com/search/?q%5Ball%5D%5B%5D=${query}` +
    `&solrorder=relevancy&format_code%5B%5D=MP3&format_code%5B%5D=WAV`;

  let html: string;
  try {
    const response = await axios.get<string>(searchUrl, {
      headers: { "User-Agent": SCRAPER_UA, "Accept-Language": getAcceptLanguage(region) },
      signal,
    });
    html = response.data;
  } catch (err) {
    if (signal?.aborted) throw err;
    return { error: "NO_MATCH_FOUND" };
  }

  const $ = cheerio.load(html);
  const listings: NewSongListing[] = [];

  // Each product card holds a release; scan its tracks individually.
  $(".product, .juno-download-listing-item, [class*='listing-item']").each((_, releaseEl) => {
    const $release = $(releaseEl);

    const releaseArtist =
      $release.find(".juno-download-listing-item__artists a, .artistname a, .artist a").first().text().trim() ||
      $release.find("[class*='artist']").first().text().trim();

    // Skip the whole card if the release artist doesn't match (saves scanning its tracks).
    if (releaseArtist && !artistMatches(releaseArtist, artist)) return;

    const releaseHref =
      $release.find(".juno-download-listing-item__title a, .productname a, h2 a, h3 a").first().attr("href") ?? "";
    const releaseUrl = releaseHref.startsWith("http")
      ? releaseHref
      : `https://www.junodownload.com${releaseHref}`;

    $release.find(".juno-download-tracklist__track, .trk, [class*='track-row'], tr.track").each((_, trackEl) => {
      const $track = $(trackEl);

      const trackTitle =
        $track.find(".juno-download-tracklist__track-title, .trk-title, [class*='title']").first().text().trim();
      if (!trackTitle || !titleMatches(trackTitle, title)) return;

      const durationText =
        $track
          .find(".juno-download-tracklist__track-length, .trk-length, [class*='length'], [class*='duration']")
          .first()
          .text()
          .trim();
      const durationMs = parseMMSS(durationText);
      if (!durationMs) return;

      const rawPriceAttr = $track.find("[data-price]").first().attr("data-price") ?? "";
      const rawPriceText =
        $track.find("[class*='buy'], [class*='price']").first().text().trim() || rawPriceAttr;
      const priceMatch = rawPriceText.match(/(\d+)[.,](\d{2})/);
      const price = priceMatch ? `${priceMatch[1]}.${priceMatch[2]}` : undefined;
      const currency = rawPriceText.includes("€") ? "EUR" : rawPriceText.includes("$") ? "USD" : "GBP";

      const url = releaseUrl || `https://www.junodownload.com`;
      if (!releaseUrl) return;

      listings.push({ songId, vendorId, url, duration: durationMs, price, currency, region } satisfies NewSongListing);
    });
  });

  const match = filterListings(listings, duration);
  if (match) return { data: match };
  return { error: "NO_MATCH_FOUND" };
};

// ── Qobuz ─────────────────────────────────────────────────────────────────────
// Qobuz has a partner API at https://www.qobuz.com/api.json/0.2/.
// Requires QOBUZ_APP_ID (register at https://www.qobuz.com/us-en/discover/api).
// Without credentials the function returns NO_MATCH_FOUND immediately.

interface QobuzSearchResponse {
  tracks?: {
    items: Array<{
      id: number;
      title: string;
      duration: number; // seconds
      performer?: { name: string; id: number };
      album?: {
        id: string | number;
        title: string;
        url?: string;
        artist?: { name: string; id: number };
      };
      price?: { value: number; currency: string };
    }>;
  };
}

const QOBUZ_LOCALES: Record<string, string> = {
  US: "us-en",
  GB: "gb-en",
  DE: "de-de",
  FR: "fr-fr",
  ES: "es-es",
  IT: "it-it",
  NL: "nl-nl",
  BE: "be-en",
  AU: "au-en",
  CA: "ca-en",
  JP: "jp-ja",
  SE: "se-sv",
  PL: "pl-pl",
};

const fetchQobuzData = async ({
  region,
  vendorData,
  songData,
  signal,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const appId = process.env.QOBUZ_APP_ID;
  if (!appId) return { error: "NO_MATCH_FOUND" };

  const query = encodeURIComponent(`${title} ${artist}`);
  const searchUrl =
    `https://www.qobuz.com/api.json/0.2/catalog/search` +
    `?query=${query}&type=tracks&limit=5&app_id=${encodeURIComponent(appId)}`;

  let data: QobuzSearchResponse;
  try {
    const response = await axios.get<QobuzSearchResponse>(searchUrl, {
      headers: { "X-App-Id": appId },
      signal,
    });
    data = response.data;
  } catch (err) {
    if (signal?.aborted) throw err;
    return { error: "NO_MATCH_FOUND" };
  }

  const locale = QOBUZ_LOCALES[region.toUpperCase()] ?? "us-en";
  const items = data?.tracks?.items ?? [];

  const listings: NewSongListing[] = items
    .filter((track) => {
      if (!track.duration) return false;
      const resultArtist = track.performer?.name ?? track.album?.artist?.name ?? "";
      return titleMatches(track.title, title) && artistMatches(resultArtist, artist);
    })
    .map((track) => {
      // Localise album URL to the requested region, then anchor to the specific track.
      const rawAlbumUrl = track.album?.url ?? "";
      const albumUrl = rawAlbumUrl
        ? rawAlbumUrl.replace(/qobuz\.com\/[a-z]{2}-[a-z]{2}\//, `qobuz.com/${locale}/`)
        : `https://www.qobuz.com/${locale}/`;
      const url = `${albumUrl}#track/${track.id}`;

      return {
        songId,
        vendorId,
        url,
        duration: track.duration * 1000,
        price:
          track.price?.value != null
            ? parseFloat(track.price.value.toString()).toFixed(2)
            : undefined,
        currency: (track.price?.currency ?? "USD").toUpperCase(),
        region,
      } satisfies NewSongListing;
    });

  const match = filterListings(listings, duration);
  if (match) return { data: match };
  return { error: "NO_MATCH_FOUND" };
};

// ── HDTracks ──────────────────────────────────────────────────────────────────
// HDTracks is a US-focused hi-res download store.
// Their site is a React SPA with hash-based routing, so standard HTML scraping
// won't find search results. The scraper first tries to extract a Next.js-style
// __NEXT_DATA__ payload (if the host migrated to Next.js), then falls back to
// Magento-style SSR product cards (their older platform).
// All prices are in USD.

interface HdtracksTrack {
  title: string;
  artist: string;
  durationMs: number;
  url: string;
  price?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractHdtracksNextData(nextData: any): HdtracksTrack[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queries: any[] = nextData?.props?.pageProps?.dehydratedState?.queries ?? [];
  const tracks: HdtracksTrack[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const q of queries as any[]) {
    const raw = q?.state?.data;
    if (!raw) continue;
    const items: unknown[] = Array.isArray(raw)
      ? raw
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : ((raw as any)?.items ?? (raw as any)?.results ?? (raw as any)?.tracks ?? []);
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const it = item as any;
      const t: string = it?.title ?? it?.name ?? "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a: string = it?.artist?.name ?? it?.artist ?? it?.performers ?? "";
      const dur: number | null = typeof it?.duration === "number" ? it.duration * 1000 : null;
      const href: string = it?.url ?? it?.canonical_url ?? it?.path ?? "";
      if (!t || !dur || !href) continue;
      tracks.push({
        title: t,
        artist: String(a),
        durationMs: dur,
        url: href.startsWith("http") ? href : `https://www.hdtracks.com${href}`,
        price: it?.price != null ? parseFloat(String(it.price)).toFixed(2) : undefined,
      });
    }
  }
  return tracks;
}

const fetchHdtracksData = async ({
  region,
  vendorData,
  songData,
  signal,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const query = encodeURIComponent(`${title} ${artist}`);
  // Try the Magento-era catalog search URL which still serves SSR HTML for some platforms.
  const searchUrl = `https://www.hdtracks.com/catalogsearch/result/?q=${query}`;

  let html: string;
  try {
    const response = await axios.get<string>(searchUrl, {
      headers: { "User-Agent": SCRAPER_UA },
      signal,
    });
    html = response.data;
  } catch (err) {
    if (signal?.aborted) throw err;
    return { error: "NO_MATCH_FOUND" };
  }

  const $ = cheerio.load(html);
  const listings: NewSongListing[] = [];

  // Path 1 — Next.js embedded data (if HDTracks migrated to Next.js)
  const nextDataText = $("#__NEXT_DATA__").text();
  if (nextDataText) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextData = JSON.parse(nextDataText) as any;
      const tracks = extractHdtracksNextData(nextData);
      for (const t of tracks) {
        if (!titleMatches(t.title, title) || !artistMatches(t.artist, artist)) continue;
        listings.push({
          songId, vendorId, url: t.url, duration: t.durationMs,
          price: t.price, currency: "USD", region,
        } satisfies NewSongListing);
      }
    } catch { /* not valid Next.js data, fall through */ }
  }

  // Path 2 — Magento-style SSR product cards
  if (!listings.length) {
    $(".product-item, .product-items li, .item.product").each((_, el) => {
      const $el = $(el);

      const cardTitle =
        $el.find(".product-item-name a, .product-item-name, .product-name a, h2 a").first().text().trim();
      if (!cardTitle || !titleMatches(cardTitle, title)) return;

      const cardArtist = $el.find(".artist, .artist-name, [class*='artist']").first().text().trim();
      if (cardArtist && !artistMatches(cardArtist, artist)) return;

      const durationText =
        $el.find(".duration, .track-length, [class*='duration'], [class*='length']").first().text().trim();
      const durationMs = parseMMSS(durationText);
      if (!durationMs) return;

      const priceText = $el.find(".price, .product-price, [class*='price']").first().text().trim();
      const priceMatch = priceText.match(/(\d+)[.,](\d{2})/);
      const price = priceMatch ? `${priceMatch[1]}.${priceMatch[2]}` : undefined;

      const trackHref =
        $el.find("a.product-item-link, a.product-name").first().attr("href") ?? "";
      if (!trackHref) return;
      const url = trackHref.startsWith("http") ? trackHref : `https://www.hdtracks.com${trackHref}`;

      listings.push({ songId, vendorId, url, duration: durationMs, price, currency: "USD", region } satisfies NewSongListing);
    });
  }

  const match = filterListings(listings, duration);
  if (match) return { data: match };
  return { error: "NO_MATCH_FOUND" };
};

// ── 7digital ──────────────────────────────────────────────────────────────────
// 7digital has a public developer API at https://api.7digital.com/1.2/.
// Requires SEVENDIGITAL_CONSUMER_KEY (register at https://developer.7digital.com/).
// Without credentials the function returns NO_MATCH_FOUND immediately.
// Duration in the response is in seconds; price includes currency code.

interface SevendigitalSearchResponse {
  searchResults?: {
    searchResult: Array<{
      type: string;
      track?: {
        id: number;
        title: string;
        url: string;
        duration: number; // seconds
        artist: { id: number; name: string; url: string };
        price?: { value: number; formattedPrice: string; currency: string; status: string };
      };
    }>;
  };
}

const fetchSevendigitalData = async ({
  region,
  vendorData,
  songData,
  signal,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const consumerKey = process.env.SEVENDIGITAL_CONSUMER_KEY;
  if (!consumerKey) return { error: "NO_MATCH_FOUND" };

  const query = encodeURIComponent(`${title} ${artist}`);
  const country = region.toUpperCase();
  const searchUrl =
    `https://api.7digital.com/1.2/track/search` +
    `?q=${query}&country=${country}&pageSize=5` +
    `&oauth_consumer_key=${encodeURIComponent(consumerKey)}` +
    `&imageSize=0&usageTypes=download&f=json`;

  let data: SevendigitalSearchResponse;
  try {
    const response = await axios.get<SevendigitalSearchResponse>(searchUrl, { signal });
    data = response.data;
  } catch (err) {
    if (signal?.aborted) throw err;
    return { error: "NO_MATCH_FOUND" };
  }

  const results = data?.searchResults?.searchResult ?? [];
  const listings: NewSongListing[] = results
    .filter((r) => r.type === "track" && r.track != null)
    .filter((r) => {
      const t = r.track!;
      return titleMatches(t.title, title) && artistMatches(t.artist.name, artist);
    })
    .map((r) => {
      const t = r.track!;
      return {
        songId,
        vendorId,
        url: t.url,
        duration: t.duration * 1000,
        price:
          t.price?.value != null ? parseFloat(t.price.value.toString()).toFixed(2) : undefined,
        currency: (t.price?.currency ?? "USD").toUpperCase(),
        region,
      } satisfies NewSongListing;
    });

  const match = filterListings(listings, duration);
  if (match) return { data: match };
  return { error: "NO_MATCH_FOUND" };
};
