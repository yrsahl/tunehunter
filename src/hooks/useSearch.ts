import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { CountryCode, isCountryCode } from "@/helpers/region";
import { api } from "@/utils/api";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";
import { FormEvent, useCallback, useEffect } from "react";
import { useActiveSearchTabStore } from "./stores/useActiveSearchTab";
import { useSearchSettingsStore } from "./stores/useSearchSettingsStore";
import useSearchStore from "./stores/useSearchStore";
import useRouterWithHelpers from "./useRouterWithHelpers";

const useSearch = () => {
  const {
    searchState,
    setSearchInput,
    setSearchId,
    setSearchRegion,
    setSearchSongArtist,
    setSearchSongTitle,
  } = useSearchStore();
  const { requestQueryData, resetQueryData } = useQueryDataContext();
  const { history } = useSearchTabDataContext();
  const { data: userData, status } = useSession();
  const { activeSearchTab, setActiveSearchTab } = useActiveSearchTabStore();
  const loggedIn = status === "authenticated";
  const router = useRouterWithHelpers();
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
    const searchTitle = router.getParams("title");

    if (!router.isReady) return;

    // ID
    if (
      !!searchIdParam &&
      !!searchRegionParam &&
      isCountryCode(searchRegionParam.toUpperCase()) &&
      !!searchArtist &&
      !!searchTitle
    ) {
      const newSearchInput = `${searchArtist} - ${searchTitle}`;
      setSearchId(searchIdParam);
      setSearchRegion(searchRegionParam);
      setSearchSongArtist(searchArtist);
      setSearchSongTitle(searchTitle);
      if (searchState.input !== newSearchInput) {
        setSearchInput(newSearchInput);
        debouncedRequestSearchData(newSearchInput);
      }
    } else {
      setSearchId(null);
      setSearchRegion(null);
      setSearchSongArtist(null);
      setSearchSongTitle(null);
      setSearchInput("");
      resetQueryData();
    }
  }, [router.isReady, router.query]);

  // On enter, request query data immediately
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;
    requestQueryData(accessToken, searchState.input, searchSettings);
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

  // Submit search
  // TODO: this function is shit, way too much going on
  const submitSearch = async (
    id: string,
    region: CountryCode,
    title: string,
    artist: string,
    hideTabs = false,
  ) => {
    // Store activity and refresh history data for user
    addSearchActivity.mutateAsync({ songId: id, region });
    history.refetchData();

    // Trigger SearchResults re-render (which starts the vendor data search)
    setSearchId(id);
    setSearchRegion(region);

    // Save other search params
    setSearchSongArtist(artist);
    setSearchSongTitle(title);
    setSearchInput(`${artist} - ${title}`);
    debouncedRequestSearchData(`${artist} - ${title}`);
    if (hideTabs) setActiveSearchTab("");

    // Push to router
    const trackSearchHref = {
      pathname: router.pathname,
      query: {
        ...router.query,
        id,
        region,
        title,
        artist,
        search: hideTabs ? "" : activeSearchTab,
      },
    };
    await router.push(trackSearchHref);
  };

  return {
    handleInputChange,
    handleSearchSubmit,
    resetSearch,
    submitSearch,
  };
};

export default useSearch;
