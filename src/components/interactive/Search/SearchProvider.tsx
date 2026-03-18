import { useQueryDataContext } from "@/contexts/QueryDataContext";
import { useSearchSettingsStore } from "@/hooks/stores/useSearchSettingsStore";
import useSearchStore from "@/hooks/stores/useSearchStore";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { isCountryCode } from "@/lib/validators";
import { ReactNode, useEffect, useMemo } from "react";

interface SearchProviderProps {
  children: ReactNode;
}

const SearchProvider = ({ children }: SearchProviderProps) => {
  const { pendingSearch, setPendingSearch, syncRouteSearch, clearRouteBackedSearch } =
    useSearchStore();
  const { requestQueryData, resetQueryData } = useQueryDataContext();
  const router = useRouterWithHelpers();
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
      syncRouteSearch({
        id: searchIdParam,
        region: searchRegionParam,
        artist: searchArtistParam,
        title: searchTitleParam,
      });

      return;
    }

    const wasCleared = clearRouteBackedSearch();
    if (wasCleared) {
      resetQueryData();
    }
  }, [
    router.isReady,
    searchArtistParam,
    searchIdParam,
    searchRegionParam,
    searchTitleParam,
    clearRouteBackedSearch,
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
