import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { api } from "@/lib/api";
import { trackEvent } from "@/lib/plausible";
import { CountryCode } from "@/lib/validators";
import { Track } from "@/types/song-types";
import { debounce } from "lodash";
import { FormEvent, useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchSettingsStore } from "./stores/useSearchSettingsStore";
import useSearchStore, { SEARCH_SUBMITTED, SelectedSearchParams } from "./stores/useSearchStore";
import { useEventEmitter } from "./useEventEmitter";
import useRouterWithHelpers from "./useRouterWithHelpers";

const MIN_SEARCH_TRACK_LENGTH = 3;

const useSearch = () => {
  const { searchState, setSearchInput, setSelectedSearch } = useSearchStore();
  const { publishEvent: publishSearchSubmitted } = useEventEmitter<SelectedSearchParams | null>(
    SEARCH_SUBMITTED,
  );
  const { setShowQueries, requestQueryData, resetQueryData } = useQueryDataContext();
  const { history } = useSearchTabDataContext();
  const router = useRouterWithHelpers();
  const addSearchActivity = api.userActivities.addSearchActivity.useMutation();
  const lastTrackedQuery = useRef<string | null>(null);

  // Are there any settings set?
  const { versionFilter, lengthFilter, lengthRange, yearFilter, yearRange } =
    useSearchSettingsStore();
  const searchSettings = useMemo(
    () => ({
      versionFilter,
      lengthFilter,
      lengthRange,
      yearFilter,
      yearRange,
    }),
    [versionFilter, lengthFilter, lengthRange, yearFilter, yearRange],
  );

  const trackSearchPerformed = (query: string) => {
    if (query.length >= MIN_SEARCH_TRACK_LENGTH && query !== lastTrackedQuery.current) {
      trackEvent("Search Performed");
      lastTrackedQuery.current = query;
    }
  };

  // On enter, request query data immediately
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    trackSearchPerformed(searchState.input);
    requestQueryData(searchState.input, searchSettings);
  };

  // On input change, debounce the request
  const debouncedRequestSearchData = useCallback(
    debounce((searchTerm: string) => {
      trackSearchPerformed(searchTerm);
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
    lastTrackedQuery.current = null;
    setSearchInput("");
    resetQueryData();
  };

  // Submit search
  const submitSearch = (track: Track, region: CountryCode) => {
    const { song, artists } = track;
    const { id, title } = song;
    const artistsJoined = artists.map((artist) => artist.name).join(", ");

    // Hide queries if currently visible
    if (setShowQueries) setShowQueries(false);

    // Update store (input text + syncRouteSearch change detection) and start the search
    setSelectedSearch({ id, region, artist: artistsJoined, title });
    publishSearchSubmitted({ id, region, artist: artistsJoined, title, track }, false);

    trackEvent("Song Selected");

    // Store search activity and refresh history data for user (fire-and-forget)
    // Use mutateAsync + promise chain so the refetch fires even if this component unmounts
    void addSearchActivity.mutateAsync({ songId: id, region })
      .then(() => history.refetchData())
      .catch((error) => console.error("User activity could not be stored", error));

    // Push to router
    const trackSearchHref = {
      pathname: router.pathname,
      query: {
        ...router.query,
        id,
        region: region.toLowerCase(),
        title,
        artist: artistsJoined,
        isPlaying: false,
      },
    };
    void router.push(trackSearchHref, undefined, { shallow: true });
  };

  return {
    handleInputChange,
    handleSearchSubmit,
    resetSearch,
    submitSearch,
  };
};

export default useSearch;
