import { SongListingContextProvider } from "@/contexts/SongListingContext";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import { SEARCH_SUBMITTED, SelectedSearchParams } from "@/hooks/stores/useSearchStore";
import { useEventEmitter } from "@/hooks/useEventEmitter";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { CountryCode } from "@/lib/validators";
import { slideInAndOutFromBottom } from "@/styles/animations";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import SongListingsContainer from "./SongListingsContainer";

const SongListings = () => {
  const { eventData: search } = useEventEmitter<SelectedSearchParams | null>(SEARCH_SUBMITTED);
  const { region } = useRegionSettings();
  const router = useRouterWithHelpers();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll into view when a search is submitted
  useEffect(() => {
    if (search && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [search]);

  // Keep the URL region param in sync with the current region setting
  useEffect(() => {
    if (!search || !router.isReady) return;
    if (router.getParams("region") !== region) {
      router.setParams({ region });
    }
  }, [region, !!search, router.isReady]);

  return (
    <AnimatePresence mode="wait">
      {search && (
        <SongListingContextProvider
          key={`${search.id}-${region}`}
          region={region as CountryCode}
          songId={search.id}
        >
          <motion.div
            {...slideInAndOutFromBottom(0.5)}
            className="w-full rounded-3xl lg:-mt-2"
            ref={containerRef}
          >
            <SongListingsContainer region={region as CountryCode} />
          </motion.div>
        </SongListingContextProvider>
      )}
    </AnimatePresence>
  );
};

export default SongListings;
