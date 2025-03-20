import { useSearchDataContext } from "@/contexts/SearchDataContext";
import { api } from "@/utils/api";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";
import { FormEvent, useCallback, useState } from "react";
import { useSearchSettingsStore } from "./stores/useSearchSettingsStore";

const useSearchFunctions = () => {
  const [searchInput, setSearchInput] = useState("");
  const { requestSearchData, resetSearchData } = useSearchDataContext();
  const { data: userData, status } = useSession();
  const loggedIn = status === "authenticated";

  const { data: spotifyAccountData } = api.account.getSpotifyAccountById.useQuery(
    { userId: userData?.user.id! },
    {
      enabled: loggedIn,
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes to refresh the access token
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  );
  const { data: clientCredentialsData } = api.clientCredentials.getToken.useQuery(undefined, {
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes to refresh the access token
  });
  const userAccessToken = spotifyAccountData?.data?.access_token;
  const appAccessToken = clientCredentialsData?.token;
  const accessToken = userAccessToken || appAccessToken;

  // Any settings set?
  const { searchForClubMixesOnly, minimumLengthOption, minimumLengthSeconds } =
    useSearchSettingsStore();
  const searchSettings = {
    searchForClubMixesOnly,
    minimumLengthOption,
    minimumLengthSeconds,
  };

  // On enter -> set directly
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;
    requestSearchData(accessToken, searchInput, searchSettings);
  };

  // On input -> debounce
  const debouncedRequestSearchData = useCallback(
    debounce((searchTerm: string) => {
      if (!accessToken) return;
      requestSearchData(accessToken, searchTerm, searchSettings);
    }, 600),
    [userAccessToken, appAccessToken, ...Object.values(searchSettings)],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Visual input
    const input = e.target.value;
    setSearchInput(input);

    // Debounced search (or cancel if empty)
    if (input) debouncedRequestSearchData(e.target.value);
    else {
      debouncedRequestSearchData.cancel();
      resetSearchData();
    }
  };

  const resetSearch = () => {
    setSearchInput("");
    resetSearchData();
  };

  return {
    handleSearchSubmit,
    searchInput,
    handleInputChange,
    resetSearch,
  };
};

export default useSearchFunctions;
