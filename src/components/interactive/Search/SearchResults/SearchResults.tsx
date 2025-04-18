import { slideInAndOutFromBottom } from "@/helpers/animations";
import useSearch from "@/hooks/useSearch";
import { AnimatePresence, motion } from "framer-motion";
import SearchResultsFrame from "./SearchResultsFrame";

interface SearchResultsProps {}

const SearchResults = ({}: SearchResultsProps) => {
  const { currentSearchId } = useSearch();

  return (
    <AnimatePresence mode="wait">
      {currentSearchId && (
        <motion.div {...slideInAndOutFromBottom()} className="bg-primar mt-3 w-full rounded-3xl">
          <SearchResultsFrame songId={currentSearchId} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchResults;
