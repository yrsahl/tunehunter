import { fetchSpotifySearchData } from "@/helpers/spotify/fetch-spotify-data";
import { SpotifySearchData } from "@/types/spotify";
import { api } from "@/utils/api";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";
import { FormEvent, useCallback, useEffect, useState } from "react";

const useSearch = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  // On enter -> set directly
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  // On input -> debounce
  const debouncedSetSearchQuery = useCallback(
    debounce((searchTerm: string) => {
      setSearchQuery(searchTerm);
    }, 600),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Visual input
    const input = e.target.value;
    setSearchInput(input);

    // Debounced search (or cancel if empty)
    if (input) debouncedSetSearchQuery(e.target.value);
    else {
      debouncedSetSearchQuery.cancel();
      setSearchQuery("");
    }
  };

  const resetSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setSearchData(null);
  };

  // Search spotify catalog
  useEffect(() => {
    const token = userAccessToken ? userAccessToken : "appAccessToken";

    // No token
    if (!token) {
      // Set error
      return;
    }

    // No search query
    if (!searchQuery) {
      setSearchData(null);
      return;
    }

    // Query api
    setIsSearchDataLoading(true);
    try {
      fetchSpotifySearchData(token, searchQuery).then((searchData) => {
        setSearchData(searchData);
        setIsSearchDataLoading(false);
      });
    } catch (error) {
      console.error(error);
      setIsSearchDataLoading(false);
    }
  }, [searchQuery]);

  return {
    searchData,
    isSearchDataLoading,
    handleSearchSubmit,
    searchInput,
    handleInputChange,
    resetSearch,
  };
};

export default useSearch;
