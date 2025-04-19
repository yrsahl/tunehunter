import { slideInAndOutFromBottom } from "@/helpers/animations";
import useSearchInput from "@/hooks/useSearchInput";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import SearchResultsFrame from "./SearchResultsFrame";

interface SearchResultsProps {}

const SearchResults = ({}: SearchResultsProps) => {
  const { searchId, searchRegion } = useSearchInput();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll into view
  useEffect(() => {
    if (searchId && searchRegion && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [searchId, searchRegion]);

  return (
    <AnimatePresence mode="wait">
      {searchId && searchRegion && (
        <motion.div
          {...slideInAndOutFromBottom(0.5)}
          className="-mt-4 w-full rounded-3xl"
          ref={containerRef}
        >
          <SearchResultsFrame songId={searchId} region={searchRegion} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchResults;
