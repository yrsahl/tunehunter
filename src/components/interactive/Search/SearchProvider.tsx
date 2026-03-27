import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { useSearchSettingsStore } from "@/hooks/stores/useSearchSettingsStore";
import useSearchStore, { SEARCH_SUBMITTED, SelectedSearchParams } from "@/hooks/stores/useSearchStore";
import { useEventEmitter } from "@/hooks/useEventEmitter";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { isCountryCode } from "@/lib/validators";
import { ReactNode, useEffect, useMemo } from "react";

interface SearchProviderProps {
  children: ReactNode;
}

const SearchProvider = ({ children }: SearchProviderProps) => {
  const { pendingSearch, setPendingSearch, syncRouteSearch, clearRouteBackedSearch } =
    useSearchStore();
  const { publishEvent: publishSearchSubmitted } = useEventEmitter<SelectedSearchParams | null>(SEARCH_SUBMITTED);
  const { requestQueryData, resetQueryData } = useQueryDataContext();
  const router = useRouterWithHelpers();
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

  const searchIdParam = router.getParams("id");
  const searchRegionParam = router.getParams("region");
  const searchArtistParam = router.getParams("artist");
  const searchTitleParam = router.getParams("title");

  useEffect(() => {
    if (!router.isReady) return;

    const regionUpper = searchRegionParam?.toUpperCase() ?? "";
    if (
      !!searchIdParam &&
      isCountryCode(regionUpper) &&
      !!searchArtistParam &&
      !!searchTitleParam
    ) {
      const hasChanged = syncRouteSearch({
        id: searchIdParam,
        region: regionUpper,
        artist: searchArtistParam,
        title: searchTitleParam,
      });

      if (hasChanged) {
        publishSearchSubmitted(
          { id: searchIdParam, region: regionUpper, artist: searchArtistParam, title: searchTitleParam },
          false,
        );
      }

      return;
    }

    const wasCleared = clearRouteBackedSearch();
    if (wasCleared) {
      publishSearchSubmitted(null, false);
      resetQueryData();
    }
  }, [
    router.isReady,
    searchArtistParam,
    searchIdParam,
    searchRegionParam,
    searchTitleParam,
    clearRouteBackedSearch,
    publishSearchSubmitted,
    resetQueryData,
    syncRouteSearch,
  ]);

  useEffect(() => {
    if (!pendingSearch) return;

    requestQueryData(pendingSearch, searchSettings, false);
    setPendingSearch(null);
  }, [pendingSearch, requestQueryData, searchSettings, setPendingSearch]);

  return <>{children}</>;
};

export default SearchProvider;
