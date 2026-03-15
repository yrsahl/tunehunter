import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { api } from "@/lib/api";
import { CountryCode } from "@/lib/validators";
import { debounce } from "lodash";
import { FormEvent, useCallback, useEffect, useMemo } from "react";
import { useSearchSettingsStore } from "./stores/useSearchSettingsStore";
import useSearchStore from "./stores/useSearchStore";
import useRouterWithHelpers from "./useRouterWithHelpers";
import useSpotifyTokens from "./useSpotifyTokens";

const useSearch = () => {
  const { searchState, setSearchInput, setSelectedSearch } = useSearchStore();
  const { setShowQueries, requestQueryData, resetQueryData } = useQueryDataContext();
  const { history } = useSearchTabDataContext();
  const router = useRouterWithHelpers();
  const { accessToken } = useSpotifyTokens();
  const addSearchActivity = api.userActivities.addSearchActivity.useMutation();

  // Are there any settings set?
  const { searchForClubMixesOnly, minimumLengthOption, minimumLengthSeconds } =
    useSearchSettingsStore();
  const searchSettings = useMemo(
    () => ({
      searchForClubMixesOnly,
      minimumLengthOption,
      minimumLengthSeconds,
    }),
    [searchForClubMixesOnly, minimumLengthOption, minimumLengthSeconds],
  );

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
    [accessToken, requestQueryData, searchSettings],
  );

  useEffect(() => {
    return () => {
      debouncedRequestSearchData.cancel();
    };
  }, [debouncedRequestSearchData]);

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
    setSelectedSearch({ id, region, artist, title });

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
