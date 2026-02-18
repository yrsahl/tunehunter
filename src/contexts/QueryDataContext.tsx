import SearchSettings from "@/components/interactive/Search/SearchSettings";
import useDb from "@/hooks/useDb";
import { filterOutDuplicates } from "@/lib/filters";
import { fetchSpotifySearchData } from "@/services/spotify";
import { SpotifySearchData } from "@/types/spotify-types";
import { createContext, ReactNode, useContext, useState } from "react";

interface IQueryDataContext {
  queryData: SpotifySearchData | null;
  showQueries: boolean;
  setShowQueries: (show: boolean) => void;
  requestQueryData: (
    query: string,
    accessToken: string,
    searchSettings?: SearchSettings,
    displayLoadingIndicator?: boolean,
  ) => void;
  isQueryDataLoading: boolean;
  resetQueryData: () => void;
}

const QueryDataContext = createContext<IQueryDataContext>({
  queryData: null,
  showQueries: false,
  setShowQueries: () => {},
  requestQueryData: () => {},
  isQueryDataLoading: false,
  resetQueryData: () => {},
});

export const useQueryDataContext = () => useContext(QueryDataContext);

export const QueryDataProvider = ({ children }: { children: ReactNode }) => {
  const [showQueries, setShowQueries] = useState(false);
  const [queryData, setQueryData] = useState<SpotifySearchData | null>(null);
  const [isQueryDataLoading, setIsQueryDataLoading] = useState(false);
  const { storeTracksInDb } = useDb();

  // Search spotify catalog
  const requestQueryData = (
    accessToken: string,
    query: string,
    searchSettings?: SearchSettings,
    displayLoadingIndicator: boolean = true,
  ) => {
    // No search query
    if (!query) {
      setQueryData(null);
      return;
    }
    setQueryData(null);

    // Display loading indicator
    if (displayLoadingIndicator) setIsQueryDataLoading(true);

    // Query api
    try {
      fetchSpotifySearchData(accessToken, query).then((searchData) => {
        if (!searchData || !searchData.tracks) return;

        // Filter out duplicates (if duration and name are the same)
        const uniqueTracks = filterOutDuplicates(searchData);
        searchData.tracks.items = uniqueTracks;

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

        // Set querydata and store the search in DB
        setQueryData(searchData);
        if (displayLoadingIndicator) setIsQueryDataLoading(false);
        storeTracksInDb(searchData.tracks.items);
      });
    } catch (error) {
      console.error(error);
      if (displayLoadingIndicator) setIsQueryDataLoading(false);
    }
  };

  // Reset query data
  const resetQueryData = () => {
    setQueryData(null);
  };

  return (
    <QueryDataContext.Provider
      value={{
        showQueries,
        setShowQueries,
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
