import { SearchSettings } from "@/hooks/stores/useSearchSettingsStore";
import { applyFilters } from "@/lib/filters";
import { fetchDbSearchData } from "@/services/db/api";
import { fetchItunesSearchData } from "@/services/itunes/api";
import { SearchData } from "@/types/search-types";
import { SpotifyTrack } from "@/types/song-types";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";

interface IQueryDataContext {
  queryData: SearchData | null;
  lastQuery: string;
  isDbFallback: boolean;
  spotifyFallbackResults: SpotifyTrack[] | null;
  setSpotifyFallbackResults: (results: SpotifyTrack[] | null) => void;
  isSpotifyFallbackLoading: boolean;
  setIsSpotifyFallbackLoading: (loading: boolean) => void;
  showQueries: boolean;
  setShowQueries: (show: boolean) => void;
  requestQueryData: (
    query: string,
    searchSettings?: SearchSettings,
    displayLoadingIndicator?: boolean,
  ) => Promise<void>;
  isQueryDataLoading: boolean;
  resetQueryData: () => void;
}

const QueryDataContext = createContext<IQueryDataContext>({
  queryData: null,
  lastQuery: "",
  isDbFallback: false,
  spotifyFallbackResults: null,
  setSpotifyFallbackResults: () => {},
  isSpotifyFallbackLoading: false,
  setIsSpotifyFallbackLoading: () => {},
  showQueries: false,
  setShowQueries: () => {},
  requestQueryData: async () => {},
  isQueryDataLoading: false,
  resetQueryData: () => {},
});

export const useQueryDataContext = () => useContext(QueryDataContext);

export const QueryDataProvider = ({ children }: { children: ReactNode }) => {
  const [showQueries, setShowQueries] = useState(false);
  const [queryData, setQueryData] = useState<SearchData | null>(null);
  const [lastQuery, setLastQuery] = useState("");
  const [isDbFallback, setIsDbFallback] = useState(false);
  const [spotifyFallbackResults, setSpotifyFallbackResults] = useState<SpotifyTrack[] | null>(null);
  const [isSpotifyFallbackLoading, setIsSpotifyFallbackLoading] = useState(false);
  const [isQueryDataLoading, setIsQueryDataLoading] = useState(false);
  const requestQueryData = useCallback(async (
    query: string,
    searchSettings?: SearchSettings,
    displayLoadingIndicator: boolean = true,
  ) => {
    if (!query) {
      setQueryData(null);
      return;
    }
    setQueryData(null);
    setLastQuery(query);
    setIsDbFallback(false);
    setSpotifyFallbackResults(null);

    if (displayLoadingIndicator) setIsQueryDataLoading(true);

    try {
      let searchData: SearchData | null = null;
      let dbFallback = false;

      try {
        searchData = await fetchItunesSearchData(query);
      } catch {
        dbFallback = true;
      }

      // iTunes failed (HTTP error, rate limit, or network issue) — fall back to DB
      if (searchData === null) {
        dbFallback = true;
        searchData = await fetchDbSearchData(query);
      }

      if (searchData) {
        const filteredData = applyFilters(searchData, searchSettings);
        setQueryData(filteredData);
        setIsDbFallback(dbFallback);
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (displayLoadingIndicator) setIsQueryDataLoading(false);
    }
  }, []);

  const resetQueryData = useCallback(() => {
    setQueryData(null);
  }, []);

  return (
    <QueryDataContext.Provider
      value={{
        showQueries,
        setShowQueries,
        queryData,
        lastQuery,
        isDbFallback,
        spotifyFallbackResults,
        setSpotifyFallbackResults,
        isSpotifyFallbackLoading,
        setIsSpotifyFallbackLoading,
        isQueryDataLoading,
        requestQueryData,
        resetQueryData,
      }}
    >
      {children}
    </QueryDataContext.Provider>
  );
};
