import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { CountryCode, isCountryCode } from "@/helpers/region";
import { api } from "@/utils/api";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchSettingsStore } from "./stores/useSearchSettingsStore";
import useRouterWithHelpers from "./useRouterWithHelpers";

const useSearch = () => {
  const [searchInput, setSearchInput] = useState("");
  const { requestQueryData, resetQueryData } = useQueryDataContext();
  const { data: userData, status } = useSession();
  const loggedIn = status === "authenticated";
  const { history } = useSearchTabData();
  const router = useRouterWithHelpers();
  const [searchId, setSearchId] = useState<string | null>(null);
  const [searchRegion, setSearchRegion] = useState<CountryCode | null>(null);
  const addSearchActivity = api.userActivities.addSearchActivity.useMutation();
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

  // Synchronize Search params from URL
  useEffect(() => {
    const searchIdParam = router.getParams("id");
    const searchRegionParam = router.getParams("region");
    const searchArtist = router.getParams("artist");
    const searchTitle = router.getParams("track");
    if (!router.isReady) return;
    if (!!searchIdParam && !!searchRegionParam && isCountryCode(searchRegionParam.toUpperCase())) {
      setSearchId(searchIdParam);
      setSearchRegion(searchRegionParam);
    } else {
      setSearchId(null);
      setSearchRegion(null);
    }
  }, [router.isReady, router.query]);

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
    // setSearchInput("");
    resetQueryData();
  };

  // Submit search manually
  const submitSearch = (id: string, region: CountryCode, title: string, artist: string) => {
    const newSearchInput = `${artist} - ${title}`;
    setSearchInput(newSearchInput);
    startVendorDataSearch(id, region);
  };

  // Start the search for vendor data
  const startVendorDataSearch = async (songId: string, userRegion: CountryCode) => {
    // 1. Store activity
    addSearchActivity.mutateAsync({ songId, region: userRegion });

    // 2. Refresh history data to show new search
    history.refetchData();

    // 3. Set the current state ID in both State + URL
    setSearchId(songId);
    setSearchRegion(userRegion);
    const trackSearchHref = {
      pathname: router.pathname,
      query: { ...router.query, id: songId, region: userRegion },
    };
    router.push(trackSearchHref);
  };

  return {
    searchId,
    searchRegion,
    startVendorDataSearch,
    searchInput,
    handleInputChange,
    handleSearchSubmit,
    resetSearch,
    submitSearch,
  };
};

export default useSearch;
