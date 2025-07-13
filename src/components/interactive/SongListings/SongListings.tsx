import { SongListingContextProvider } from "@/contexts/SongListingContext";
import { slideInAndOutFromBottom } from "@/helpers/animations";
import useSearchStore from "@/hooks/stores/useSearchStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import SongListingsContainer from "./SongListingsContainer";

const SongListings = () => {
  const { searchState } = useSearchStore();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll into view
  useEffect(() => {
    if (searchState.id && searchState.region && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchState.id, searchState.region]);

  return (
    <AnimatePresence mode="wait">
      {searchState.id && searchState.region && (
        <SongListingContextProvider region={searchState.region} songId={searchState.id}>
          <motion.div
            {...slideInAndOutFromBottom(0.5)}
            className="-mt-4 w-full rounded-3xl"
            ref={containerRef}
          >
            <SongListingsContainer region={searchState.region} />
          </motion.div>
        </SongListingContextProvider>
      )}
    </AnimatePresence>
  );
};

export default SongListings;
