import useFavorites from "@/hooks/useFavorites";
import { fadeIn } from "@/styles/animations";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import FavoritesStatusIcon from "./FavoritesStatusIcon";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableRow from "./TableRow";

const FavoritesTable = () => {
  const { favoritesData, favoritesDataIsLoading } = useFavorites();

  return favoritesDataIsLoading ? (
    <motion.div key="skeleton" {...fadeIn(0.3)} className="h-full w-full">
      <SkeletonTable hasHeader={false} hasExtraElement />
    </motion.div>
  ) : favoritesData?.length ? (
    <motion.div key="content" {...fadeIn(0.3)} className="h-full w-full">
      <div className="hide-scrollbars relative h-full w-full overflow-scroll overflow-x-hidden px-3 pb-4 pt-2 sm:px-5 sm:pt-4 md:px-7">
        <table className="w-full table-fixed">
          <tbody>
            <LayoutGroup id="favorites">
              <AnimatePresence>
                {favoritesData.map((track) => (
                  <TableRow
                    key={track.song.id}
                    track={track}
                    showDuration
                    extraElement={<FavoritesStatusIcon variant="small" songId={track.song.id} />}
                  />
                ))}
              </AnimatePresence>
            </LayoutGroup>
          </tbody>
        </table>
      </div>
    </motion.div>
  ) : (
    <motion.div key="empty" {...fadeIn(0.2)} className="h-full w-full">
      <NoDataMessage message="Your favorites are empty! Add songs by clicking the heart icon on the results page." />
    </motion.div>
  );
};

export default FavoritesTable;
