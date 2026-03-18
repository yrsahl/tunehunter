import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { api } from "@/lib/api";
import { generateSongId } from "@/lib/songId";
import { CountryCode } from "@/lib/validators";
import { debounce } from "lodash";
import { FormEvent, useCallback, useEffect, useMemo } from "react";
import { useSearchSettingsStore } from "./stores/useSearchSettingsStore";
import useSearchStore from "./stores/useSearchStore";
import useRouterWithHelpers from "./useRouterWithHelpers";
const useSearch = () => {
  const { searchState, setSearchInput, setSelectedSearch } = useSearchStore();
  const { setShowQueries, requestQueryData, resetQueryData } = useQueryDataContext();
  const { history } = useSearchTabDataContext();
  const router = useRouterWithHelpers();
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
    requestQueryData(searchState.input, searchSettings);
  };

  // On input change, debounce the request
  const debouncedRequestSearchData = useCallback(
    debounce((searchTerm: string) => {
      requestQueryData(searchTerm, searchSettings);
    }, 600),
    [requestQueryData, searchSettings],
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
  const submitSearch = async (_id: string, region: CountryCode, title: string, artist: string) => {
    const songId = generateSongId(title, artist);

    // Hide queries
    setShowQueries(false);

    // Trigger SearchResults re-render (which starts the vendor data search)
    setSelectedSearch({ id: songId, region, artist, title });

    // Refresh
    requestQueryData(`${artist} - ${title}`, searchSettings, false);

    // Store activity and refresh history data for user
    await addSearchActivity.mutateAsync({ songId, region });
    history.refetchData();

    // Push to router
    const trackSearchHref = {
      pathname: router.pathname,
      query: {
        ...router.query,
        id: songId,
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
