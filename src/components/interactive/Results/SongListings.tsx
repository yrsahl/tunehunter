import { SongListingContextProvider } from "@/contexts/SongListingContext";
import { SEARCH_SUBMITTED, SelectedSearchParams } from "@/hooks/stores/useSearchStore";
import { useEventEmitter } from "@/hooks/useEventEmitter";
import { slideInAndOutFromBottom } from "@/styles/animations";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import SongListingsContainer from "./SongListingsContainer";

const SongListings = () => {
  const { eventData: search } = useEventEmitter<SelectedSearchParams | null>(SEARCH_SUBMITTED);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll into view when a search is submitted
  useEffect(() => {
    if (search && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [search]);

  return (
    <AnimatePresence mode="wait">
      {search && (
        <SongListingContextProvider region={search.region} songId={search.id}>
          <motion.div
            {...slideInAndOutFromBottom(0.5)}
            className="w-full rounded-3xl lg:-mt-2"
            ref={containerRef}
          >
            <SongListingsContainer region={search.region} />
          </motion.div>
        </SongListingContextProvider>
      )}
    </AnimatePresence>
  );
};

export default SongListings;
