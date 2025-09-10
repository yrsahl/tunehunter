import { NewSongListing } from "@/server/api/schemas/song-listings-schemas";
import { currencySymbolMap } from "@/lib/formatters/currency";

/**
 * This function checks an array of VendorTracks and returns the closest matching song by duration.
 * If there is none within a 2s window, it returns undefined.
 * @param listings - Array of listings to filter.
 * @param duration - The duration of the song we are looking for.
 */
export const filterListings = (listings: NewSongListing[], duration: number) => {
  // Sort by duration
  const sortedTracks = listings.sort((a, b) => {
    return Math.abs(a.duration - duration) - Math.abs(b.duration - duration);
  });

  // Check if the first track is within a 2s window
  if (sortedTracks[0] && Math.abs(sortedTracks[0].duration - duration) <= 2000) {
    return sortedTracks[0];
  }

  // Return empty object if no match found
  return undefined;
};

export const transformCurrencyStringToIcon = (currency: string) => {
  // Check if the currency is in the map
  if (currencySymbolMap[currency]) {
    return currencySymbolMap[currency];
  }

  // If not, return the original currency string
  return currency;
};
