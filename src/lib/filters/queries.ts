import SearchSettings from "@/components/interactive/Search/SearchSettings";
import { SearchData } from "@/types/search-types";

export const filterOutDuplicates = (searchData: SearchData) => {
  const uniqueTracks = new Map();
  searchData.tracks?.items.forEach((track) => {
    const key = `${track.name}-${track.duration_ms}`;
    if (!uniqueTracks.has(key)) {
      uniqueTracks.set(key, track);
    }
  });
  return Array.from(uniqueTracks.values());
};

export const applyFilters = (data: SearchData, searchSettings?: SearchSettings) => {
  data.tracks.items = filterOutDuplicates(data);

  if (searchSettings?.searchForClubMixesOnly) {
    data.tracks.items = data.tracks.items.filter((track) => {
      return (
        track.name.toLowerCase().includes("club") || track.name.toLowerCase().includes("extended")
      );
    });
  }

  if (searchSettings?.minimumLengthOption && searchSettings?.minimumLengthSeconds) {
    data.tracks.items = data.tracks.items.filter((track) => {
      return track.duration_ms >= searchSettings.minimumLengthSeconds * 1000;
    });
  }

  return data;
};
