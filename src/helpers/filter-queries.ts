import { SpotifySearchData } from "@/types/spotify";

export const filterOutDuplicates = (searchData: SpotifySearchData) => {
  const uniqueTracks = new Map();
  searchData.tracks!.items.forEach((track) => {
    const key = `${track.name}-${track.duration_ms}`;
    if (!uniqueTracks.has(key)) {
      uniqueTracks.set(key, track);
    }
  });
  return Array.from(uniqueTracks.values());
};
