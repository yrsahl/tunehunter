import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { api } from "@/lib/api";
import { CountryCode, isCountryCode } from "@/lib/validators";
import { debounce } from "lodash";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchSettingsStore } from "./stores/useSearchSettingsStore";
import useSearchStore from "./stores/useSearchStore";
import { useEffectDebugger } from "./useEffectDebugger";
import useRouterWithHelpers from "./useRouterWithHelpers";
import useSpotifyTokens from "./useSpotifyTokens";

const useSearch = () => {
  const {
    searchState,
    setSearchInput,
    setSearchId,
    setSearchRegion,
    setSearchSongArtist,
    setSearchSongTitle,
  } = useSearchStore();
  const { setShowQueries, requestQueryData, resetQueryData } = useQueryDataContext();
  const { history } = useSearchTabDataContext();
  const router = useRouterWithHelpers();
  const { accessToken } = useSpotifyTokens();
  const addSearchActivity = api.userActivities.addSearchActivity.useMutation();

  // Track pending search that needs to happen when accessToken becomes available
  const [pendingSearch, setPendingSearch] = useState<string | null>(null);

  // Are there any settings set?
  const { searchForClubMixesOnly, minimumLengthOption, minimumLengthSeconds } =
    useSearchSettingsStore();
  const searchSettings = {
    searchForClubMixesOnly,
    minimumLengthOption,
    minimumLengthSeconds,
  };

  console.log("accessToken", accessToken);
  console.log("router query", router.query);

  // Synchronize Search params from URL
  useEffectDebugger(() => {
    if (!router.isReady) return;

    const searchIdParam = router.getParams("id");
    const searchRegionParam = router.getParams("region");
    const searchArtistParam = router.getParams("artist");
    const searchTitleParam = router.getParams("title");

    // If params are present
    if (
      !!searchIdParam &&
      !!searchRegionParam &&
      isCountryCode(searchRegionParam.toUpperCase()) &&
      !!searchArtistParam &&
      !!searchTitleParam
    ) {
      // Set params
      const newSearchInput = `${searchArtistParam} - ${searchTitleParam}`;
      setSearchId(searchIdParam);
      setSearchRegion(searchRegionParam);
      setSearchSongArtist(searchArtistParam);
      setSearchSongTitle(searchTitleParam);

      // If it's a new query, i.e. a page refresh, start a new search
      if (searchState.input !== newSearchInput) {
        console.log("hi");
        setSearchInput(newSearchInput);
        setPendingSearch(newSearchInput); // Set pending search because accessToken is not yet available (TODO: Look for a better way)
      }
      return;
    }

    // If no params are present, reset
    setSearchId(null);
    setSearchRegion(null);
    setSearchSongArtist(null);
    setSearchSongTitle(null);
    setSearchInput("");
    console.log("hi2");
    resetQueryData();
  }, [accessToken, router.query]);

  // Execute pending search when accessToken becomes available
  useEffect(() => {
    if (accessToken && pendingSearch) {
      requestQueryData(accessToken, pendingSearch, searchSettings, false);
      setPendingSearch(null); // Clear the pending search
    }
  }, [accessToken, pendingSearch]);

  // On enter, request query data immediately
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!accessToken) return;
    requestQueryData(accessToken, searchState.input, searchSettings);
  };

  // On input change, debounce the request
  const debouncedRequestSearchData = useCallback(
    debounce((searchTerm: string) => {
      if (!accessToken) {
        return;
      }
      requestQueryData(accessToken, searchTerm, searchSettings);
    }, 600),
    [accessToken, ...Object.values(searchSettings)],
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
  const submitSearch = async (id: string, region: CountryCode, title: string, artist: string) => {
    // Hide queries
    setShowQueries(false);

    // Trigger SearchResults re-render (which starts the vendor data search)
    setSearchId(id);
    setSearchRegion(region);

    // Save other search params
    setSearchSongArtist(artist);
    setSearchSongTitle(title);
    setSearchInput(`${artist} - ${title}`);

    // Refresh
    if (accessToken) requestQueryData(accessToken, `${artist} - ${title}`, searchSettings, false);

    // Store activity and refresh history data for user
    await addSearchActivity.mutateAsync({ songId: id, region });
    history.refetchData();

    // Push to router
    const trackSearchHref = {
      pathname: router.pathname,
      query: {
        ...router.query,
        id,
        region,
        title,
        artist,
        isPlaying: false,
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
