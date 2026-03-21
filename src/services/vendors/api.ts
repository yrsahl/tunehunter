import { NewSongListing } from "@/server/api/schemas/song-listings-schemas";
import { ITunesData } from "@/types/itunes-types";
import axios from "axios";
import * as cheerio from "cheerio";
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
  vendorData: { vendorId: number; store: "itunes" | "bandcamp" | "beatport" | "amazon" };
  songData: {
    songId: string;
    title: string;
    artist: string;
    duration: number;
  };
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
}: IFetchVendorData): Promise<VendorDataResponse> => {
  if (vendorData.store === "itunes") return await fetchItunesData({ region, vendorData, songData });
  if (vendorData.store === "beatport")
    return await fetchBeatportData({ region, vendorData, songData });
  if (vendorData.store === "bandcamp")
    return await fetchBandcampData({ region, vendorData, songData });
  if (vendorData.store === "amazon") return await fetchAmazonData({ region, vendorData, songData });

  return {
    error: "VENDOR_NOT_SUPPORTED",
  };
};

// iTunes
const fetchItunesData = async ({
  region,
  vendorData,
  songData,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  // Query the iTunes Music API
  const dataUrl = new URL(
    `https://itunes.apple.com/search?country=${region}&media=music&entity=song&limit=5&term=${title}+${artist}`,
  ).href;
  const response = await axios.get<ITunesData>(dataUrl);

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
    price: song.trackPrice?.toString(),
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

const fetchAmazonData = async ({
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

  // Headers must be sorted alphabetically for canonical form
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
        // DetailPageURL already contains the affiliate tag
        url: item.DetailPageURL,
        duration,
        price: listing.Price.Amount.toString(),
        currency: listing.Price.Currency ?? "GBP",
        region,
      },
    };
  }

  return { error: "NO_MATCH_FOUND" };
};

// Beatport - Next.js app; all track data (duration, price, id) is embedded in __NEXT_DATA__
// on the search page, so no second request is needed.
const fetchBeatportData = async ({
  region,
  vendorData,
  songData,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const query = encodeURIComponent(`${title} ${artist}`);
  const searchUrl = `https://www.beatport.com/search?q=${query}`;

  const response = await axios.get<string>(searchUrl, {
    headers: { "User-Agent": SCRAPER_UA, "Accept-Language": getAcceptLanguage(region) },
    timeout: 10_000,
  });

  const $ = cheerio.load(response.data);
  const nextDataText = $("#__NEXT_DATA__").text();
  if (!nextDataText) return { error: "NO_MATCH_FOUND" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let nextData: any;
  try {
    nextData = JSON.parse(nextDataText);
  } catch {
    return { error: "NO_MATCH_FOUND" };
  }

  // Walk the dehydrated React Query cache for a query that contains track results
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queries: any[] = nextData?.props?.pageProps?.dehydratedState?.queries ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tracks: any[] = [];
  for (const q of queries) {
    if (Array.isArray(q?.state?.data?.tracks?.data)) {
      tracks = q.state.data.tracks.data;
      break;
    }
  }

  if (!tracks.length) return { error: "NO_MATCH_FOUND" };

  const listings: NewSongListing[] = tracks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((t: any) => {
      if (t?.price?.value == null || typeof t?.length !== "number") return false;
      const resultTitle = [t.track_name as string, t.mix_name as string].filter(Boolean).join(" ");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultArtist = (t.artists as { artist_name: string }[] | undefined)?.map((a) => a.artist_name).join(" ") ?? "";
      return titleMatches(resultTitle, title) && artistMatches(resultArtist, artist);
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((t: any) => {
      // Build a URL slug from track name + mix name, e.g. "echelon-original-mix/17711829"
      const slugParts = [t.track_name as string, t.mix_name as string]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const url = `https://www.beatport.com/track/${slugParts}/${t.track_id as number}`;

      return {
        songId,
        vendorId,
        url,
        duration: t.length as number,
        price: (t.price.value as number).toFixed(2),
        currency: ((t.price.code as string | undefined) ?? "USD").toUpperCase(),
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
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const query = encodeURIComponent(`${title} ${artist}`);
  const searchUrl = `https://bandcamp.com/search?q=${query}&item_type=t`;

  // No Accept-Language here — Bandcamp localises the .itemtype text (e.g. "TITEL" in German)
  // which would break the "TRACK" filter. Price is read from the track page instead.
  const searchResponse = await axios.get<string>(searchUrl, {
    headers: { "User-Agent": SCRAPER_UA },
    timeout: 10_000,
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

  // Visit up to 3 candidate pages and pick the best duration match
  const MAX_CANDIDATES = 3;
  let bestUrl: string | null = null;
  let bestPrice: string | null = null;
  let bestCurrency = "USD";
  let bestDurationMs = 0;
  let bestDelta = Infinity;

  for (const url of candidateUrls.slice(0, MAX_CANDIDATES)) {
    let trackResponse;
    try {
      trackResponse = await axios.get<string>(url, {
        headers: { "User-Agent": SCRAPER_UA, "Accept-Language": getAcceptLanguage(region) },
        timeout: 10_000,
      });
    } catch {
      continue;
    }

    // Artist check: extract from subdomain (e.g. "diedlonelyy" from diedlonelyy.bandcamp.com)
    const subdomain = new URL(url).hostname.replace(".bandcamp.com", "");
    if (!artistMatches(subdomain, artist)) continue;

    const $track = cheerio.load(trackResponse.data);
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
          price = (offers.price as number).toString();
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
