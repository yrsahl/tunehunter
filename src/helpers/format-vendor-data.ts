import { VendorTrackData } from "@/types/vendor";
import { currencySymbolMap } from "./currency";

/**
 * This function checks an array of VendorTracks and returns the closest matching song by duration.
 * If there is none within a 5s window, it returns undefined.
 * @param tracks Provided data
 * @param wantedDuration The desired duration of the track
 */
export const findBestSongMatch = (tracks: VendorTrackData[], wantedDuration: number) => {
  // Sort by duration
  const sortedTracks = tracks.sort((a, b) => {
    return Math.abs(a.duration - wantedDuration) - Math.abs(b.duration - wantedDuration);
  });

  // Check if the first track is within a 5s window
  if (sortedTracks[0] && Math.abs(sortedTracks[0].duration - wantedDuration) <= 5000) {
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
