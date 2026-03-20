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
    quality: "256kbps", // iTunes standard quality
    price: song.trackPrice?.toString(),
    currency: song.currency,
    region,
    format: "AAC", // iTunes standard format
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

// Amazon - region maps to the appropriate Amazon storefront
const AMAZON_DOMAIN_MAP: Record<string, string> = {
  US: "www.amazon.com",
  GB: "www.amazon.co.uk",
  DE: "www.amazon.de",
  FR: "www.amazon.fr",
  ES: "www.amazon.es",
  IT: "www.amazon.it",
  JP: "www.amazon.co.jp",
  CA: "www.amazon.ca",
  AU: "www.amazon.com.au",
  MX: "www.amazon.com.mx",
  BR: "www.amazon.com.br",
  IN: "www.amazon.in",
  NL: "www.amazon.nl",
  SE: "www.amazon.se",
  PL: "www.amazon.pl",
  TR: "www.amazon.com.tr",
  SG: "www.amazon.sg",
  AE: "www.amazon.ae",
  SA: "www.amazon.sa",
};

const AMAZON_CURRENCY_MAP: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  JP: "JPY",
  CA: "CAD",
  AU: "AUD",
  MX: "MXN",
  BR: "BRL",
  IN: "INR",
  NL: "EUR",
  SE: "SEK",
  PL: "PLN",
  TR: "TRY",
  SG: "SGD",
  AE: "AED",
  SA: "SAR",
};

const fetchAmazonData = async ({
  region,
  vendorData,
  songData,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const domain = AMAZON_DOMAIN_MAP[region.toUpperCase()] ?? "www.amazon.com";
  const currency = AMAZON_CURRENCY_MAP[region.toUpperCase()] ?? "USD";
  const query = encodeURIComponent(`${title} ${artist}`);
  // n:163856011 is the US-only digital music node; other storefronts use i=digital-music alone
  const isUS = region.toUpperCase() === "US";
  const searchUrl = isUS
    ? `https://${domain}/s?k=${query}&i=digital-music&rh=n%3A163856011`
    : `https://${domain}/s?k=${query}&i=digital-music`;

  const response = await axios.get<string>(searchUrl, {
    headers: { "User-Agent": SCRAPER_UA, "Accept-Language": getAcceptLanguage(region) },
    timeout: 10_000,
  });
  // console.log("amazon response", response);

  const $ = cheerio.load(response.data);

  let foundListing: NewSongListing | undefined;

  $('[data-component-type="s-search-result"]').each((_, el) => {
    if (foundListing) return;
    const $el = $(el);

    const titleEl = $el.find("h2 a.a-link-normal").first();
    const titleText = titleEl.text().trim();
    const href = titleEl.attr("href");
    const priceText = $el.find(".a-price .a-offscreen").first().text().trim();

    if (!titleText || !priceText || !href) return;

    // Rough match: result title must contain the track title or artist
    const titleLower = titleText.toLowerCase();
    if (!titleLower.includes(title.toLowerCase()) && !titleLower.includes(artist.toLowerCase()))
      return;

    const priceMatch = priceText.match(/[\d.,]+/);
    if (!priceMatch) return;

    foundListing = {
      songId,
      vendorId,
      // Amazon search result hrefs are relative
      url: href.startsWith("http") ? href : `https://${domain}${href}`,
      // Amazon search doesn't surface track duration; use input duration so
      // filterListings can accept this result
      duration,
      quality: "256kbps",
      price: priceMatch[0],
      currency,
      region,
      format: "MP3",
    };
  });

  if (foundListing) return { data: foundListing };
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
    .filter((t: any) => t?.price?.value != null && typeof t?.length === "number")
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
        quality: "MP3 (& WAV)",
        price: (t.price.value as number).toFixed(2),
        currency: ((t.price.code as string | undefined) ?? "USD").toUpperCase(),
        region,
        format: "320kbps",
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

  const searchResponse = await axios.get<string>(searchUrl, {
    headers: { "User-Agent": SCRAPER_UA, "Accept-Language": getAcceptLanguage(region) },
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

    const $track = cheerio.load(trackResponse.data);
    let durationMs: number | null = null;
    let price: string | null = null;
    let currency = "USD";

    $track('script[type="application/ld+json"]').each((_, el) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json = JSON.parse($track(el).html() ?? "") as any;
        if (json.duration) durationMs = parseBandcampDuration(json.duration as string);
        const offers = json?.inAlbum?.albumRelease?.[0]?.offers;
        if (offers?.price != null) {
          price = (offers.price as number).toString();
          currency = ((offers.priceCurrency as string | undefined) ?? "USD").toUpperCase();
        }
      } catch {
        // not valid JSON-LD, skip
      }
    });

    if (durationMs === null) continue;
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
      quality: "Multiple",
      price: bestPrice,
      currency: bestCurrency,
      region,
      format: "",
    } satisfies NewSongListing,
  };
};
