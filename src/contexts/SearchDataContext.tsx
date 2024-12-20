import { fetchSpotifySearchData } from "@/helpers/spotify/fetch-spotify-data";
import { SpotifySearchData } from "@/types/spotify";
import { createContext, ReactNode, useContext, useState } from "react";

interface ISearchDataContext {
  searchData: SpotifySearchData | null;
  requestSearchData: (query: string, accessToken: string) => void;
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
  const requestSearchData = (query: string, accessToken: string) => {
    // No search query
    if (!query) {
      setSearchData(null);
      return;
    }

    // Query api
    setIsSearchDataLoading(true);
    try {
      fetchSpotifySearchData(accessToken, query).then((searchData) => {
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
