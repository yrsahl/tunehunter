import { SearchDataContextProvider } from "@/contexts/SearchDataContext";
import { slideInAndOutFromBottom } from "@/helpers/animations";
import useSearchStore from "@/hooks/stores/useSearchStore";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import SearchResultsFrame from "./SearchResultsFrame";

interface SearchResultsProps {}

const SearchResults = ({}: SearchResultsProps) => {
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
        <SearchDataContextProvider region={searchState.region} songId={searchState.id}>
          <motion.div
            {...slideInAndOutFromBottom(0.5)}
            className="-mt-4 w-full rounded-3xl"
            ref={containerRef}
          >
            <SearchResultsFrame region={searchState.region} />
          </motion.div>
        </SearchDataContextProvider>
      )}
    </AnimatePresence>
  );
};

export default SearchResults;
