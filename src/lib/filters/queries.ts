import { SearchSettings } from "@/hooks/stores/useSearchSettingsStore";
import { SearchData } from "@/types/search-types";

const REMIX_KEYWORDS = ["remix", "re-edit", "bootleg", "mashup", "cover", "radio edit", "club edit"];
const EXTENDED_KEYWORDS = ["extended", "original mix", "club mix", "club version", "long version", "full version"];

export const filterOutDuplicates = (searchData: SearchData) => {
  const uniqueTracks = new Map();
  searchData.tracks?.items.forEach((track) => {
    const key = `${track.song.title}-${track.song.duration}`;
    if (!uniqueTracks.has(key)) {
      uniqueTracks.set(key, track);
    }
  });
  return Array.from(uniqueTracks.values());
};

export const applyFilters = (data: SearchData, searchSettings?: SearchSettings) => {
  data.tracks.items = filterOutDuplicates(data);

  if (searchSettings?.versionFilter && searchSettings.versionFilter !== "all") {
    const { versionFilter } = searchSettings;
    data.tracks.items = data.tracks.items.filter((track) => {
      const title = track.song.title.toLowerCase();
      const hasRemixKeyword = REMIX_KEYWORDS.some((kw) => title.includes(kw));
      const hasExtendedKeyword = EXTENDED_KEYWORDS.some((kw) => title.includes(kw));

      if (versionFilter === "originals") return !hasRemixKeyword;
      if (versionFilter === "remixes") return hasRemixKeyword;
      if (versionFilter === "extended") return hasExtendedKeyword;
      return true;
    });
  }

  if (searchSettings?.lengthFilter) {
    const [minSec, maxSec] = searchSettings.lengthRange;
    data.tracks.items = data.tracks.items.filter((track) => {
      const durationSec = track.song.duration / 1000;
      return durationSec >= minSec && durationSec <= maxSec;
    });
  }

  if (searchSettings?.yearFilter) {
    const [minYear, maxYear] = searchSettings.yearRange;
    data.tracks.items = data.tracks.items.filter((track) => {
      const year = parseInt(track.song.year);
      return !isNaN(year) && year >= minYear && year <= maxYear;
    });
  }

  return data;
};
