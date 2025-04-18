import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { api } from "@/utils/api";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";
import { FormEvent, useCallback, useState } from "react";
import { useSearchSettingsStore } from "./stores/useSearchSettingsStore";

const useSearchInput = () => {
  const [searchInput, setSearchInput] = useState("");
  const { requestQueryData, resetQueryData } = useQueryDataContext();
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

  // Are there any settings set?
  const { searchForClubMixesOnly, minimumLengthOption, minimumLengthSeconds } =
    useSearchSettingsStore();
  const searchSettings = {
    searchForClubMixesOnly,
    minimumLengthOption,
    minimumLengthSeconds,
  };

  // On enter, request query data immediately
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;
    requestQueryData(accessToken, searchInput, searchSettings);
  };

  // On input change, debounce the request
  const debouncedRequestSearchData = useCallback(
    debounce((searchTerm: string) => {
      if (!accessToken) return;
      requestQueryData(accessToken, searchTerm, searchSettings);
    }, 600),
    [userAccessToken, appAccessToken, ...Object.values(searchSettings)],
  );

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Create visual input
    const input = e.target.value;
    setSearchInput(input);

    // Debounce the search (or cancel if empty)
    if (input) debouncedRequestSearchData(e.target.value);
    else {
      debouncedRequestSearchData.cancel();
      resetQueryData();
    }
  };

  // Reset the search input and query data
  const resetSearch = () => {
    setSearchInput("");
    resetQueryData();
  };

  return {
    searchInput,
    handleInputChange,
    handleSearchSubmit,
    resetSearch,
  };
};

export default useSearchInput;
