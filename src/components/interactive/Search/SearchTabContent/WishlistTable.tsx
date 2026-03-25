import useWishlist from "@/hooks/useWishlist";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableRow from "./TableRow";
import WishlistStatusIcon from "./WishlistStatusIcon";

const WishlistTable = () => {
  const { wishlistData, wishlistDataIsLoading } = useWishlist();

  if (wishlistDataIsLoading) return <SkeletonTable hasHeader={false} hasExtraElement />;

  if (!wishlistData?.length)
    return (
      <NoDataMessage message="Your wishlist is empty! Add songs by clicking the heart icon on the results page." />
    );

  return (
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
  );
};

export default WishlistTable;
