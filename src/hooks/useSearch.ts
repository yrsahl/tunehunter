import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { CountryCode, isCountryCode } from "@/helpers/region";
import { api } from "@/utils/api";
import { useEffect, useState } from "react";
import useRouterWithHelpers from "./useRouterWithHelpers";

const useSearch = () => {
  const { history } = useSearchTabData();
  const router = useRouterWithHelpers();
  const [searchId, setSearchId] = useState<string | null>(null);
  const [searchRegion, setSearchRegion] = useState<CountryCode | null>(null);
  const addSearchActivity = api.userActivities.addSearchActivity.useMutation();

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

  // Start the search
  const startSearch = async (songId: string, userRegion: CountryCode) => {
    // 1. Store activity
    addSearchActivity.mutateAsync({ songId, region: userRegion });

    // 2. Refresh history data to show new search
    history.refetchData();
    // setShowResults(false);

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
    startSearch,
  };
};

export default useSearch;
