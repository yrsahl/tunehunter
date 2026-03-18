import SearchSettings from "@/components/interactive/Search/SearchSettings";
import useDb from "@/hooks/useDb";
import { filterOutDuplicates } from "@/lib/filters";
import { fetchItunesSearchData } from "@/services/itunes/api";
import { fetchMusicBrainzSearchData } from "@/services/musicbrainz/api";
import { SearchData } from "@/types/search-types";
import { createContext, ReactNode, useContext, useState } from "react";

interface IQueryDataContext {
  queryData: SearchData | null;
  showQueries: boolean;
  setShowQueries: (show: boolean) => void;
  requestQueryData: (
    query: string,
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
  const [queryData, setQueryData] = useState<SearchData | null>(null);
  const [isQueryDataLoading, setIsQueryDataLoading] = useState(false);
  const { storeTracksInDb } = useDb();

  const requestQueryData = (
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

    const applyFiltersAndStore = (data: SearchData) => {
      data.tracks.items = filterOutDuplicates(data);

      if (searchSettings?.searchForClubMixesOnly) {
        data.tracks.items = data.tracks.items.filter((track) => {
          return (
            track.name.toLowerCase().includes("club") ||
            track.name.toLowerCase().includes("extended")
          );
        });
      }

      if (searchSettings?.minimumLengthOption && searchSettings?.minimumLengthSeconds) {
        data.tracks.items = data.tracks.items.filter((track) => {
          return track.duration_ms >= searchSettings.minimumLengthSeconds * 1000;
        });
      }

      setQueryData(data);
      if (displayLoadingIndicator) setIsQueryDataLoading(false);
      storeTracksInDb(data.tracks.items);
    };

    try {
      fetchItunesSearchData(query).then(async (itunesData) => {
        if (itunesData?.tracks?.items.length) {
          applyFiltersAndStore(itunesData);
          return;
        }

        // iTunes returned nothing — fall back to MusicBrainz
        const mbData = await fetchMusicBrainzSearchData(query);
        if (!mbData?.tracks) {
          if (displayLoadingIndicator) setIsQueryDataLoading(false);
          return;
        }
        applyFiltersAndStore(mbData);
      });
    } catch (error) {
      console.error(error);
      if (displayLoadingIndicator) setIsQueryDataLoading(false);
    }
  };

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
