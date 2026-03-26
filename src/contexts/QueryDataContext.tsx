import { SearchSettings } from "@/hooks/stores/useSearchSettingsStore";
import { applyFilters } from "@/lib/filters";
import { fetchItunesSearchData } from "@/services/itunes/api";
import { SearchData } from "@/types/search-types";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";

interface IQueryDataContext {
  queryData: SearchData | null;
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

    if (displayLoadingIndicator) setIsQueryDataLoading(true);

    try {
      const itunesData = await fetchItunesSearchData(query);
      if (itunesData) {
        const filteredData = applyFilters(itunesData, searchSettings);
        setQueryData(filteredData);
      }

      // iTunes returned nothing — fall back to MusicBrainz
      // const mbData = await fetchMusicBrainzSearchData(query);
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
        isQueryDataLoading,
        requestQueryData,
        resetQueryData,
      }}
    >
      {children}
    </QueryDataContext.Provider>
  );
};
