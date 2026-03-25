import useWishlist from "@/hooks/useWishlist";
import { fadeIn } from "@/styles/animations";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableRow from "./TableRow";
import WishlistStatusIcon from "./WishlistStatusIcon";

const WishlistTable = () => {
  const { wishlistData, wishlistDataIsLoading } = useWishlist();

  return wishlistDataIsLoading ? (
    <motion.div key="skeleton" {...fadeIn(0.3)} className="h-full w-full">
      <SkeletonTable hasHeader={false} hasExtraElement />
    </motion.div>
  ) : wishlistData?.length ? (
    <motion.div key="content" {...fadeIn(0.3)} className="h-full w-full">
      <div className="hide-scrollbars relative h-full w-full overflow-scroll overflow-x-hidden px-3 pb-4 pt-2 sm:px-5 sm:pt-4 md:px-7">
        <table className="w-full table-fixed">
          <tbody>
            <LayoutGroup id="wishlist">
              <AnimatePresence>
                {wishlistData.map((track) => (
                  <TableRow
                    key={track.song.id}
                    track={track}
                    showDuration
                    extraElement={<WishlistStatusIcon variant="small" songId={track.song.id} />}
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
      <NoDataMessage message="Your wishlist is empty! Add songs by clicking the heart icon on the results page." />
    </motion.div>
  );
};

export default WishlistTable;
