import SearchSettings from "@/components/interactive/Search/SearchSettings";
import { fetchSpotifySearchData } from "@/helpers/spotify/fetch-spotify-data";
import useDb from "@/hooks/useDb";
import { SpotifySearchData } from "@/types/spotify";
import { createContext, ReactNode, useContext, useState } from "react";

interface IQueryDataContext {
  queryData: SpotifySearchData | null;
  requestQueryData: (query: string, accessToken: string, searchSettings?: SearchSettings) => void;
  isQueryDataLoading: boolean;
  resetQueryData: () => void;
}

const QueryDataContext = createContext<IQueryDataContext>({
  queryData: null,
  requestQueryData: () => {},
  isQueryDataLoading: false,
  resetQueryData: () => {},
});

export const useQueryDataContext = () => useContext(QueryDataContext);

export const QueryDataProvider = ({ children }: { children: ReactNode }) => {
  const [queryData, setQueryData] = useState<SpotifySearchData | null>(null);
  const [isQueryDataLoading, setIsQueryDataLoading] = useState(false);
  const { storeTracksInDb } = useDb();

  // Search spotify catalog
  const requestQueryData = (
    accessToken: string,
    query: string,
    searchSettings?: SearchSettings,
  ) => {
    // No search query
    if (!query) {
      setQueryData(null);
      return;
    }

    // Query api
    setIsQueryDataLoading(true);
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
        setQueryData(searchData);
        setIsQueryDataLoading(false);
        storeTracksInDb(searchData.tracks.items);
      });
    } catch (error) {
      console.error(error);
      setIsQueryDataLoading(false);
    }
  };

  // Reset query data
  const resetQueryData = () => {
    setQueryData(null);
  };

  return (
    <QueryDataContext.Provider
      value={{
        queryData,
        isQueryDataLoading,
        requestQueryData,
        resetQueryData,
      }}
    >
      {children}
    </QueryDataContext.Provider>
  );
};
