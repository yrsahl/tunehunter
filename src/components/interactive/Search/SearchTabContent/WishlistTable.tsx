import useWishlist from "@/hooks/useWishlist";
import { fadeInAndOut } from "@/styles/animations";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableBody from "./TableBody";
import TableRow from "./TableRow";
import WishlistStatusIcon from "./WishlistStatusIcon";

const WishlistTable = () => {
  const { wishlistData, wishlistDataIsLoading } = useWishlist();
  const wishlistDataExists = !!wishlistData && wishlistData.length > 0;

  return (
    <AnimatePresence mode="wait">
      <motion.div {...fadeInAndOut(0.2)} className="h-full w-full">
        {/* Loading */}
        {wishlistDataIsLoading && <SkeletonTable hasHeader={false} tab="history" />}
        {/* Ready */}
        {!wishlistDataIsLoading && !wishlistDataExists && (
          <NoDataMessage message="Your wishlist is empty! Add songs by clicking the heart icon on the results page." />
        )}
        {wishlistDataExists && (
          <TableBody hasHeader={false}>
            <LayoutGroup id="wishlist">
              <AnimatePresence>
                {wishlistData.map((wishlistedTrack) => (
                  <TableRow
                    track={wishlistedTrack}
                    key={wishlistedTrack.song.id}
                    showDuration={true}
                    extraElement={
                      <WishlistStatusIcon variant="small" songId={wishlistedTrack.song.id} />
                    }
                  />
                ))}
              </AnimatePresence>
            </LayoutGroup>
          </TableBody>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default WishlistTable;
