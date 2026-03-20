import { NewSongListing } from "@/server/api/schemas/song-listings-schemas";
import { ITunesData } from "@/types/itunes-types";
import axios from "axios";
import * as cheerio from "cheerio";
import { filterListings } from ".";

const SCRAPER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

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
  const itunesListings: NewSongListing[] = response.data.results.map((song) => ({
    songId,
    vendorId,
    url: song.trackViewUrl,
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
  // n:163856011 = Amazon digital music category
  const searchUrl = `https://${domain}/s?k=${query}&i=digital-music&rh=n%3A163856011`;
  console.log("searching amazon with URL ", searchUrl);

  const response = await axios.get<string>(searchUrl, {
    headers: { "User-Agent": SCRAPER_UA },
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

// Beatport - Two prices: Base price for MP3 and surcharge of 0.75 for WAV, AIFF, FLAC
// Beatport's website is a Next.js app; track data is embedded in __NEXT_DATA__ JSON.
const fetchBeatportData = async ({
  region,
  vendorData,
  songData,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  const query = encodeURIComponent(`${title} ${artist}`);
  const searchUrl = `https://www.beatport.com/search?q=${query}`;
  console.log("searching beatport with URL ", searchUrl);

  const response = await axios.get<string>(searchUrl, {
    headers: { "User-Agent": SCRAPER_UA },
    timeout: 10_000,
  });

  // console.log("beatport response", response);

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
    .filter((t: any) => t?.price?.value != null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((t: any) => {
      // Duration can appear as milliseconds, or as { minutes, seconds }
      const durationMs: number =
        t?.duration?.milliseconds ??
        (t?.duration?.minutes != null
          ? ((t.duration.minutes as number) * 60 + ((t.duration.seconds as number) ?? 0)) * 1000
          : null) ??
        (typeof t?.length === "number" ? (t.length as number) * 1000 : null) ??
        0;

      return {
        songId,
        vendorId,
        url: `https://www.beatport.com${(t.slug as string) ?? `/track/${t.id as string}`}`,
        duration: durationMs,
        quality: "MP3",
        price: (t.price.value as number).toFixed(2),
        currency: ((t.price.code as string | undefined) ?? "USD").toUpperCase(),
        region,
        format: "MP3",
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
        headers: { "User-Agent": SCRAPER_UA },
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
      format: "FLAC / MP3",
    } satisfies NewSongListing,
  };
};
