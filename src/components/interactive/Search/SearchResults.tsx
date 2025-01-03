import { fadeInAndOut } from "@/helpers/animations";
import { SpotifySearchData } from "@/types/spotify";
import { motion } from "framer-motion";
import SearchTrackRow from "./SearchTrackRow";

interface SearchTableProps {
  searchData: SpotifySearchData;
}

const SearchResults = ({ searchData }: SearchTableProps) => {
  return (
    <motion.div
      {...fadeInAndOut()}
      className="absolute z-50 h-60 w-full overflow-scroll rounded-b-lg border border-t-[1px] border-primary bg-background/30 text-lg backdrop-blur-md"
    >
      <div className="px-3 py-3 sm:px-5 md:px-7">
        {/* <p className="text-center text-foreground/50">
          {searchData.tracks?.total} results found for 'love'.
        </p> */}
        <table>
          <motion.tbody {...fadeInAndOut(0.5)} key={searchData.tracks?.href}>
            {searchData.tracks?.items.map((track) => (
              <SearchTrackRow key={track.id} track={track} />
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default SearchResults;
