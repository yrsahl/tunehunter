import { slideInAndOutFromBottom } from "@/helpers/animations";
import useSearch from "@/hooks/useSearch";
import { AnimatePresence, motion } from "framer-motion";
import SearchResultsTable from "./SearchResultsTable";

interface SearchResultsProps {}

const SearchResults = ({}: SearchResultsProps) => {
  const { currentSearchId } = useSearch();

  return (
    <AnimatePresence mode="wait">
      {currentSearchId && (
        <motion.div
          {...slideInAndOutFromBottom()}
          className="w-full rounded-3xl border-2 border-primary bg-primary/10"
        >
          <SearchResultsTable songId={currentSearchId} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchResults;
