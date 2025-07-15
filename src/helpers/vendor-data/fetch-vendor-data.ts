/**
 * Vendor Data Fetching Implementation
 *
 * This file implements music store search functionality for various vendors.
 *
 * API Availability Status:
 * - iTunes: ✅ Full API available (iTunes Search API)
 * - Bandcamp: ⚠️ Limited API (only for labels/partners, no public search)
 * - Beatport: ❌ No public API available
 * - Amazon Music: ❌ API in closed beta
 *
 * Implementation Approaches:
 *
 * 1. iTunes (WORKING):
 *    - Uses official iTunes Search API
 *    - Reliable, rate-limited, good data quality
 *
 * 2. Bandcamp (BASIC IMPLEMENTATION):
 *    - Web scraping of search results
 *    - Works for basic searches but limited data
 *    - Could be enhanced with individual track page scraping
 *
 * 3. Beatport (REQUIRES PUPPETEER):
 *    - Heavy JavaScript usage, needs browser automation
 *    - Install: npm install puppeteer @types/puppeteer
 *    - Anti-bot measures require sophisticated handling
 *
 * 4. Amazon Music (REQUIRES PUPPETEER + ANTI-BOT):
 *    - Most difficult to implement due to heavy protection
 *    - Requires session management, proxy rotation, CAPTCHA solving
 *    - Consider Amazon Product Advertising API as alternative
 *
 * Production Recommendations:
 * - Use official APIs when available
 * - Implement caching to reduce API calls
 * - Add retry logic with exponential backoff
 * - Monitor for changes in vendor website structures
 * - Consider third-party aggregation services
 */

import { NewSongListing } from "@/server/api/schemas/song-listings-schemas";
import { ITunesData } from "@/types/itunes-types";
import axios from "axios";
import * as cheerio from "cheerio";
import { filterListings } from "./format-vendor-data";

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

// Helper function to create search headers
const getSearchHeaders = () => ({
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  DNT: "1",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
});

// Helper function to clean and normalize track/artist names for comparison
const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

// Helper function to calculate string similarity
const calculateSimilarity = (str1: string, str2: string): number => {
  const normalized1 = normalizeString(str1);
  const normalized2 = normalizeString(str2);

  if (normalized1 === normalized2) return 1;
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return 0.8;

  // Simple word overlap calculation
  const words1 = normalized1.split(" ");
  const words2 = normalized2.split(" ");
  const commonWords = words1.filter((word) => words2.includes(word));

  return commonWords.length / Math.max(words1.length, words2.length);
};

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
    songId: songId,
    vendorId: vendorId,
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

// Beatport - Two prices: Base price for MP3 and surcharge of 0.75 for WAV, AIFF, FLAC
const fetchBeatportData = async ({
  region,
  vendorData,
  songData,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  try {
    // Beatport search URL - they use a search endpoint
    const searchQuery = encodeURIComponent(`${artist} ${title}`);
    const searchUrl = `https://www.beatport.com/search?q=${searchQuery}`;

    // Beatport heavily uses JavaScript and has anti-bot measures
    // For a production implementation, you would need:
    // 1. Puppeteer or Playwright for JavaScript rendering
    // 2. Proper session management and cookies
    // 3. Potentially rotating proxies to avoid rate limiting

    const response = await axios.get(searchUrl, {
      headers: getSearchHeaders(),
      timeout: 10000,
    });

    // Beatport loads content dynamically with JavaScript, so HTML scraping won't work well
    // The search results are loaded via AJAX after the initial page load
    // You would need to:
    // 1. Use puppeteer to wait for the search results to load
    // 2. Parse the dynamically loaded content
    // 3. Extract track information, prices (MP3 base price + surcharge for higher quality)

    // For development/testing, you could try to find their API endpoints
    // by examining network requests in browser dev tools

    return {
      error: "NO_MATCH_FOUND",
    };

    // TODO: Implement with puppeteer for JavaScript rendering
    // Example implementation would look like:
    /*
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(searchUrl);
    await page.waitForSelector('.track-grid-item'); // Wait for results to load
    
    const beatportListings: NewSongListing[] = await page.evaluate(() => {
      const trackElements = document.querySelectorAll('.track-grid-item');
      return Array.from(trackElements).map(element => {
        // Extract track data from the DOM
        const title = element.querySelector('.track-title')?.textContent;
        const artist = element.querySelector('.track-artist')?.textContent;
        const price = element.querySelector('.price')?.textContent;
        // ... more extraction logic
        return { ... };
      });
    });
    
    await browser.close();
    const filteredBeatportListing = filterListings(beatportListings, duration);
    if (filteredBeatportListing) return { data: filteredBeatportListing };
    */
  } catch (error) {
    console.error("Beatport search error:", error);
    return {
      error: "NO_MATCH_FOUND",
    };
  }
};

// Helper function to parse duration from Bandcamp track pages
const parseBandcampDuration = (durationText: string): number => {
  if (!durationText) return 0;

  // Remove any non-numeric characters except colon
  const cleanDuration = durationText.replace(/[^\d:]/g, "");
  const parts = cleanDuration.split(":");

  if (parts.length === 2 && parts[0] && parts[1]) {
    const minutes = parseInt(parts[0], 10) || 0;
    const seconds = parseInt(parts[1], 10) || 0;
    return (minutes * 60 + seconds) * 1000; // Convert to milliseconds
  }

  return 0;
};

// Helper function to fetch and parse individual Bandcamp track page
const fetchBandcampTrackDetails = async (trackUrl: string) => {
  try {
    const fullUrl = trackUrl.startsWith("http") ? trackUrl : `https://bandcamp.com${trackUrl}`;

    const response = await axios.get(fullUrl, {
      headers: getSearchHeaders(),
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Extract duration from the track page
    // Bandcamp stores duration in various places, try multiple selectors
    let duration = 0;

    // Try to find duration in the player data
    const playerDataScript = $("script")
      .filter((i, el) => {
        const scriptContent = $(el).html();
        return scriptContent
          ? scriptContent.includes("TralbumData") || scriptContent.includes("duration")
          : false;
      })
      .first()
      .html();

    if (playerDataScript) {
      // Look for duration in the JavaScript data
      const durationMatch = playerDataScript.match(/"duration":\s*(\d+(?:\.\d+)?)/);
      if (durationMatch && durationMatch[1]) {
        duration = parseFloat(durationMatch[1]) * 1000; // Convert seconds to milliseconds
      }
    }

    // Fallback: try to find duration in HTML elements
    if (duration === 0) {
      const durationElements = [
        $(".time_total"),
        $(".track_info .time"),
        $('[class*="duration"]'),
        $('[class*="time"]'),
      ];

      for (const $elem of durationElements) {
        const durationText = $elem.text().trim();
        if (durationText && durationText.match(/\d+:\d+/)) {
          duration = parseBandcampDuration(durationText);
          if (duration > 0) break;
        }
      }
    }

    // Extract more accurate price information from track page
    let price = null;
    let currency = "USD";

    const buyButton = $(".buyItem");
    if (buyButton.length > 0) {
      const priceText = buyButton.find(".price").text().trim();
      if (priceText && priceText !== "Free" && priceText !== "name your price") {
        const priceMatch = priceText.match(/([A-Z$€£¥]+)\s*(\d+(?:\.\d+)?)/);
        if (priceMatch && priceMatch[1] && priceMatch[2]) {
          currency = priceMatch[1];
          price = priceMatch[2];
        }
      } else if (priceText === "Free") {
        price = "0";
      }
    }

    return { duration, price, currency };
  } catch (error) {
    console.error(`Error fetching Bandcamp track details from ${trackUrl}:`, error);
    return { duration: 0, price: null, currency: "USD" };
  }
};

// Bandcamp - One price (base price or more) for many different formats (MP3 V0, MP3 320, FLAC, AAC, Ogg Vorbis, ALAC, WAV, AIFF)
const fetchBandcampData = async ({
  region,
  vendorData,
  songData,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  try {
    // Bandcamp search URL - search for tracks only
    const searchQuery = encodeURIComponent(`${artist} ${title}`);
    const searchUrl = `https://bandcamp.com/search?q=${searchQuery}&item_type=t`;

    const response = await axios.get(searchUrl, {
      headers: getSearchHeaders(),
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const candidateResults: Array<{
      title: string;
      artist: string;
      url: string;
      searchPrice: string | null;
      searchCurrency: string;
      titleSimilarity: number;
      artistSimilarity: number;
    }> = [];

    // Parse search results from Bandcamp's search page and collect candidates
    $(".searchresult").each((index, element) => {
      if (index >= 3) return false; // Only process first 3 results

      const $result = $(element);

      // Extract track information
      const trackTitle = $result.find(".heading a").text().trim();
      const artistName = $result.find(".subhead").text().replace("by ", "").trim();
      const trackUrl = $result.find(".heading a").attr("href");

      // Get price information if available from search results
      const priceText = $result.find(".price").text().trim();
      let searchPrice = null;
      let searchCurrency = "USD";

      if (priceText && priceText !== "Free" && priceText !== "name your price") {
        const priceMatch = priceText.match(/([A-Z$€£¥]+)\s*(\d+(?:\.\d+)?)/);
        if (priceMatch && priceMatch[1] && priceMatch[2]) {
          searchCurrency = priceMatch[1];
          searchPrice = priceMatch[2];
        }
      } else if (priceText === "Free") {
        searchPrice = "0";
      }

      // Only include if we have basic track info
      if (trackTitle && artistName && trackUrl) {
        // Check if this result matches our search criteria using similarity calculation
        const titleSimilarity = calculateSimilarity(trackTitle, title);
        const artistSimilarity = calculateSimilarity(artistName, artist);

        // Require both title and artist to have reasonable similarity
        if (titleSimilarity >= 0.5 && artistSimilarity >= 0.5) {
          candidateResults.push({
            title: trackTitle,
            artist: artistName,
            url: trackUrl,
            searchPrice,
            searchCurrency,
            titleSimilarity,
            artistSimilarity,
          });
        }
      }
    });

    console.log(`Found ${candidateResults.length} candidate tracks on Bandcamp`);

    // Now visit each candidate's individual track page to get duration
    for (const candidate of candidateResults) {
      try {
        console.log(`Checking track details for: ${candidate.title} by ${candidate.artist}`);

        const {
          duration: trackDuration,
          price: pagePrice,
          currency: pageCurrency,
        } = await fetchBandcampTrackDetails(candidate.url);

        if (trackDuration > 0) {
          const durationDiff = Math.abs(trackDuration - duration);
          console.log(
            `Duration difference: ${durationDiff}ms (target: ${duration}ms, found: ${trackDuration}ms)`,
          );

          // Check if duration is within 2 seconds (2000ms)
          if (durationDiff <= 2000) {
            console.log(`Found matching track: ${candidate.title} by ${candidate.artist}`);

            // Use more accurate price from individual page if available, otherwise fall back to search result
            const finalPrice = pagePrice !== null ? pagePrice : candidate.searchPrice;
            const finalCurrency = pagePrice !== null ? pageCurrency : candidate.searchCurrency;

            const bandcampListing: NewSongListing = {
              songId: songId,
              vendorId: vendorId,
              url: candidate.url.startsWith("http")
                ? candidate.url
                : `https://bandcamp.com${candidate.url}`,
              duration: trackDuration,
              format: "Multiple", // Multiple formats available
              quality: "Multiple", // Bandcamp offers various formats
              price: finalPrice,
              currency: finalCurrency,
              region,
            };

            return { data: bandcampListing };
          }
        } else {
          console.log(`Could not extract duration for: ${candidate.title} by ${candidate.artist}`);
        }

        // Add a small delay between requests to be respectful
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error processing candidate ${candidate.url}:`, error);
        continue; // Continue with next candidate
      }
    }

    console.log("No Bandcamp tracks found within 2 seconds duration tolerance");
    return {
      error: "NO_MATCH_FOUND",
    };
  } catch (error) {
    console.error("Bandcamp search error:", error);
    return {
      error: "NO_MATCH_FOUND",
    };
  }
};

// Amazon
const fetchAmazonData = async ({
  region,
  vendorData,
  songData,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  try {
    // Amazon Music search - they have a search endpoint but require authentication
    // Alternative: Amazon Music store search (for purchase, not streaming)
    const searchQuery = encodeURIComponent(`${artist} ${title}`);
    const searchUrl = `https://www.amazon.com/s?k=${searchQuery}&i=digital-music&ref=sr_st_relevancerank`;

    const response = await axios.get(searchUrl, {
      headers: getSearchHeaders(),
      timeout: 10000,
    });

    // Amazon's search results are heavily JavaScript-dependent and protected
    // They also have sophisticated anti-bot measures, so scraping often fails
    // For production use, you would need:
    // 1. Puppeteer/Playwright for JavaScript rendering
    // 2. Session management with proper cookies and headers
    // 3. Proxy rotation to avoid rate limiting and IP blocks
    // 4. CAPTCHA solving capabilities
    // 5. Proper parsing of their specific HTML structure

    // Alternative approaches:
    // 1. Amazon Product Advertising API (requires approval and has limitations)
    // 2. Amazon Music for Developers API (currently in closed beta)
    // 3. Third-party services that aggregate music store data

    const $ = cheerio.load(response.data);

    // Amazon often returns 503 or blocks requests, but if successful:
    // Results would be in elements like [data-component-type="s-search-result"]
    // Track titles in .a-size-medium.a-color-base.a-text-normal
    // Artists in .a-size-base
    // Prices in .a-price-whole, .a-price-fraction

    // For now, return no match found due to anti-bot measures
    return {
      error: "NO_MATCH_FOUND",
    };

    // TODO: Implement with proper scraping infrastructure or official API access
    // const amazonListings: NewSongListing[] = [];
    // const filteredAmazonListing = filterListings(amazonListings, duration);
    // if (filteredAmazonListing) return { data: filteredAmazonListing };
  } catch (error) {
    console.error("Amazon Music search error:", error);
    return {
      error: "NO_MATCH_FOUND",
    };
  }
};
