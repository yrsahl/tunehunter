import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { api } from "@/lib/api";
import { CountryCode } from "@/lib/validators";
import { Track, TrackArtist } from "@/types/song-types";
import { debounce } from "lodash";
import { FormEvent, useCallback, useEffect, useMemo } from "react";
import { useSearchSettingsStore } from "./stores/useSearchSettingsStore";
import useSearchStore, { SEARCH_SUBMITTED, SelectedSearchParams } from "./stores/useSearchStore";
import { useEventEmitter } from "./useEventEmitter";
import useRouterWithHelpers from "./useRouterWithHelpers";
import useSpotifyTokens from "./useSpotifyTokens";
const useSearch = () => {
  const { searchState, setSearchInput, setSelectedSearch } = useSearchStore();
  const { publishEvent: publishSearchSubmitted } = useEventEmitter<SelectedSearchParams | null>(
    SEARCH_SUBMITTED,
  );
  const { setShowQueries, requestQueryData, resetQueryData } = useQueryDataContext();
  const { history } = useSearchTabDataContext();
  const router = useRouterWithHelpers();
  const addSearchActivity = api.userActivities.addSearchActivity.useMutation();
  const { mutate: enrichArtists } = api.song.enrichArtists.useMutation();
  const { userAccessToken } = useSpotifyTokens();

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
  const submitSearch = async (track: Track, region: CountryCode) => {
    const { song, artists } = track;
    const { id, title } = song;
    const artistsJoined = artists.map((artist) => artist.name).join(", ");

    console.log("song", song, "artists", artists);

    // Hide queries if currently visible
    if (setShowQueries) setShowQueries(false);

    // Enrich song data if logged in and not yet fully rich
    const isArtistComplete = (a: TrackArtist) => a.popularity != null && a.followers != null;
    const isTrackRich = !!song.spotifyId && artists.every(isArtistComplete);
    if (userAccessToken && !isTrackRich) {
      enrichArtists({ songId: id, accessToken: userAccessToken });
    }

    // Update store (input text + syncRouteSearch change detection) and start the search
    setSelectedSearch({ id, region, artist: artistsJoined, title });
    publishSearchSubmitted({ id, region, artist: artistsJoined, title }, false);

    // Refresh query data to show new queries for selected song
    requestQueryData(`${artistsJoined} - ${title}`, searchSettings, false);

    // Store search activity and refresh history data for user
    try {
      await addSearchActivity.mutateAsync({ songId: id, region });
      history.refetchData();
    } catch (error) {
      console.error(
        "User activity could not be stored, probably due to missing song in database",
        error,
      );
    }

    // Push to router
    const trackSearchHref = {
      pathname: router.pathname,
      query: {
        ...router.query,
        id,
        region,
        title,
        artist: artistsJoined,
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
