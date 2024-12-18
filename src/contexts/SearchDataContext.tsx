import { fetchSpotifySearchData } from "@/helpers/spotify/fetch-spotify-data";
import { SpotifySearchData } from "@/types/spotify";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { createContext, ReactNode, useContext, useState } from "react";

interface ISearchDataContext {
  searchData: SpotifySearchData | null;
  requestSearchData: (query: string) => void;
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
  const { data: userData } = useSession();
  const { data: spotifyAccountData } = api.account.getSpotifyAccountById.useQuery(
    { userId: userData?.user.id! },
    {
      refetchOnWindowFocus: false,
      enabled: !!userData,
    },
  );
  const userAccessToken = spotifyAccountData?.data?.access_token;

  const token = userAccessToken ? userAccessToken : "appAccessToken";

  // Search spotify catalog
  const requestSearchData = (query: string) => {
    // No token
    if (!token) {
      // Set error
      return;
    }

    // No search query
    if (!query) {
      setSearchData(null);
      return;
    }

    // Query api
    setIsSearchDataLoading(true);
    try {
      fetchSpotifySearchData(token, query).then((searchData) => {
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
