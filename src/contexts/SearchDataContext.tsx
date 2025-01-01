import SearchSettings from "@/components/interactive/Search/SearchSettings";
import { fetchSpotifySearchData } from "@/helpers/spotify/fetch-spotify-data";
import { SpotifySearchData } from "@/types/spotify";
import { createContext, ReactNode, useContext, useState } from "react";

interface ISearchDataContext {
  searchData: SpotifySearchData | null;
  requestSearchData: (query: string, accessToken: string, searchSettings?: SearchSettings) => void;
  isSearchDataLoading: boolean;
  resetSearchData: () => void;
}

const SearchDataContext = createContext<ISearchDataContext>({
  searchData: null,
  requestSearchData: () => {},
  isSearchDataLoading: false,
  resetSearchData: () => {},
});

export const useSearchDataContext = () => useContext(SearchDataContext);

export const SearchDataProvider = ({ children }: { children: ReactNode }) => {
  const [searchData, setSearchData] = useState<SpotifySearchData | null>(null);
  const [isSearchDataLoading, setIsSearchDataLoading] = useState(false);

  // Search spotify catalog
  const requestSearchData = (
    accessToken: string,
    query: string,
    searchSettings?: SearchSettings,
  ) => {
    // No search query
    if (!query) {
      setSearchData(null);
      return;
    }

    // Query api
    setIsSearchDataLoading(true);
    try {
      fetchSpotifySearchData(accessToken, query).then((searchData) => {
        if (!searchData || !searchData.tracks) return;

        // If club mixes only is set, filter out everything else
        if (searchSettings?.searchForClubMixesOnly) {
          searchData.tracks.items = searchData?.tracks?.items.filter((track) => {
            return (
              track.name.toLowerCase().includes("club") ||
              track.name.toLowerCase().includes("extended")
            );
          });
        }

        // If minimum length is set, filter out everything shorter
        if (searchSettings?.minimumLengthOption && searchSettings?.minimumLengthSeconds) {
          searchData.tracks.items = searchData?.tracks?.items.filter((track) => {
            return track.duration_ms >= searchSettings.minimumLengthSeconds * 1000;
          });
        }

        // Query data until we have limit of songs

        setSearchData(searchData);
        setIsSearchDataLoading(false);
      });
    } catch (error) {
      console.error(error);
      setIsSearchDataLoading(false);
    }
  };

  const resetSearchData = () => {
    setSearchData(null);
  };

  return (
    <SearchDataContext.Provider
      value={{
        searchData,
        isSearchDataLoading,
        requestSearchData,
        resetSearchData,
      }}
    >
      {children}
    </SearchDataContext.Provider>
  );
};
