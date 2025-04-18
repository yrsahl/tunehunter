import { fadeInAndOut } from "@/helpers/animations";
import useSearch from "@/hooks/useSearch";
import { AnimatePresence, motion } from "framer-motion";
import SearchResultsTable from "./SearchResultsTable";

interface SearchResultsProps {}

const SearchResults = ({}: SearchResultsProps) => {
  const { currentSearchId } = useSearch();

  return (
    <AnimatePresence mode="wait">
      {currentSearchId && (
        <motion.div key={currentSearchId} {...fadeInAndOut(0.2)}>
          <SearchResultsTable songId={currentSearchId} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchResults;
