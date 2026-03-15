import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { useSearchSettingsStore } from "@/hooks/stores/useSearchSettingsStore";
import useSearchStore from "@/hooks/stores/useSearchStore";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import useSpotifyTokens from "@/hooks/useSpotifyTokens";
import { isCountryCode } from "@/lib/validators";
import { ReactNode, useEffect, useMemo } from "react";

interface SearchProviderProps {
  children: ReactNode;
}

const SearchProvider = ({ children }: SearchProviderProps) => {
  const {
    setSearchInput,
    setSearchId,
    setSearchRegion,
    setSearchSongArtist,
    setSearchSongTitle,
    pendingSearch,
    setPendingSearch,
  } = useSearchStore();
  const { requestQueryData, resetQueryData } = useQueryDataContext();
  const router = useRouterWithHelpers();
  const { accessToken } = useSpotifyTokens();

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

  const searchIdParam = router.getParams("id");
  const searchRegionParam = router.getParams("region");
  const searchArtistParam = router.getParams("artist");
  const searchTitleParam = router.getParams("title");

  useEffect(() => {
    if (!router.isReady) return;

    if (
      !!searchIdParam &&
      !!searchRegionParam &&
      isCountryCode(searchRegionParam.toUpperCase()) &&
      !!searchArtistParam &&
      !!searchTitleParam
    ) {
      const newSearchInput = `${searchArtistParam} - ${searchTitleParam}`;

      const currentSearchState = useSearchStore.getState().searchState;
      const isNewRouteSearch =
        currentSearchState.id !== searchIdParam ||
        currentSearchState.region !== searchRegionParam ||
        currentSearchState.songArtist !== searchArtistParam ||
        currentSearchState.songTitle !== searchTitleParam;

      if (isNewRouteSearch) {
        setSearchId(searchIdParam);
        setSearchRegion(searchRegionParam);
        setSearchSongArtist(searchArtistParam);
        setSearchSongTitle(searchTitleParam);
        setSearchInput(newSearchInput);
        setPendingSearch(newSearchInput);
      }

      return;
    }

    const currentSearchState = useSearchStore.getState().searchState;
    const hasRouteBackedSearch =
      !!currentSearchState.id ||
      !!currentSearchState.region ||
      !!currentSearchState.songArtist ||
      !!currentSearchState.songTitle;

    if (!hasRouteBackedSearch) return;

    setSearchId(null);
    setSearchRegion(null);
    setSearchSongArtist(null);
    setSearchSongTitle(null);
    setSearchInput("");
    resetQueryData();
  }, [
    router.isReady,
    searchArtistParam,
    searchIdParam,
    searchRegionParam,
    searchTitleParam,
    resetQueryData,
    setSearchId,
    setSearchInput,
    setSearchRegion,
    setSearchSongArtist,
    setSearchSongTitle,
    setPendingSearch,
  ]);

  useEffect(() => {
    if (!accessToken || !pendingSearch) return;

    requestQueryData(accessToken, pendingSearch, searchSettings, false);
    setPendingSearch(null);
  }, [accessToken, pendingSearch, requestQueryData, searchSettings, setPendingSearch]);

  return <>{children}</>;
};

export default SearchProvider;
