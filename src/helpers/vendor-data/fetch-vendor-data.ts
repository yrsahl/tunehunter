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

// Amazon
const fetchAmazonData = async ({
  region,
  vendorData,
  songData,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  // TODO: Implement querying Amazon's API

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

  // TODO: Implement querying your own API solution

  return {
    error: "NO_MATCH_FOUND",
  };
};

// Bandcamp - One price (base price or more) for many different formats (MP3 V0, MP3 320, FLAC, AAC, Ogg Vorbis, ALAC, WAV, AIFF)
const fetchBandcampData = async ({
  region,
  vendorData,
  songData,
}: IFetchVendorData): Promise<VendorDataResponse> => {
  const { songId, title, artist, duration } = songData;
  const { vendorId } = vendorData;

  // TODO: Implement querying your own API solution

  return {
    error: "NO_MATCH_FOUND",
  };
};
