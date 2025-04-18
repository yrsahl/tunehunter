import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { api } from "@/utils/api";
import { useEffect, useState } from "react";
import useRegionSettings from "./settings/useRegionSettings";
import useRouterWithHelpers from "./useRouterWithHelpers";

const useSearch = () => {
  const { history } = useSearchTabData();
  const { region } = useRegionSettings();
  const router = useRouterWithHelpers();
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);
  const addSearchActivity = api.userActivities.addSearchActivity.useMutation();

  // Synchronize Search ID from URL
  useEffect(() => {
    const searchIdParam = router.getParams("id");
    if (router.isReady && !!searchIdParam) {
      setCurrentSearchId(searchIdParam);
    } else {
      setCurrentSearchId(null);
    }
  }, [router.isReady, router.query]);

  // Start the search
  const startSearch = async (songId: string) => {
    // 1. Store activity
    addSearchActivity.mutateAsync({ songId, region });

    // 2. Refresh history data to show new search
    history.refetchData();
    // setShowResults(false);

    // 3. Set the current state ID in both State + URL
    setCurrentSearchId(songId);
    const trackSearchHref = {
      pathname: router.pathname,
      query: { ...router.query, id: songId },
    };
    router.push(trackSearchHref);
  };

  return {
    currentSearchId,
    setCurrentSearchId,
    startSearch,
  };
};

export default useSearch;
