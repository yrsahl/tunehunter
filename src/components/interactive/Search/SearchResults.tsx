import { slideInFromAbove } from "@/helpers/animations";
import { SpotifySearchData } from "@/types/spotify";
import { motion } from "framer-motion";
import SearchTrackRow from "./SearchTrackRow";

interface SearchTableProps {
  searchData: SpotifySearchData;
}

const SearchResults = ({ searchData }: SearchTableProps) => {
  return (
    <motion.div
      {...slideInFromAbove()}
      className="hide-scrollbars absolute z-50 h-60 w-full overflow-scroll rounded-b-lg border border-t-[1px] border-primary bg-background/30 backdrop-blur-md"
    >
      <div className="px-3 py-3 sm:px-5 md:px-7">
        <table>
          <tbody>
            {searchData.tracks?.items.map((track) => (
              <SearchTrackRow key={track.id} track={track} />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SearchResults;
