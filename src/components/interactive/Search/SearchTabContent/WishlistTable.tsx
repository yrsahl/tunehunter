import CustomIcon from "@/components/CustomIcon";
import { Button } from "@/components/ui/button";
import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import { Track } from "@/types/song";
import { api } from "@/utils/api";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import ConfirmationModal from "../../Modals/ConfirmationModal";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableBody from "./TableBody";
import TableRow from "./TableRow";

const WishlistTable = () => {
  const {
    wishlist: { data, refetchData, isLoading },
  } = useSearchTabData();
  const wishlistDataExists = !!data && data.length > 0;
  const removeUserActivity = api.userActivities.removeUserActivityByType.useMutation();

  const unfavoriteTrack = (track: Track) => {
    removeUserActivity.mutate({ songId: track.song.id, type: "wishlist" });
    refetchData();
  };

  const WishlistStatusIcon = ({ track }: { track: Track }) => {
    const heartControls = useAnimation();
    const heartbreakControls = useAnimation();

    const handleMouseEnter = () => {
      heartControls.start({ opacity: 0 });
      heartbreakControls.start({ opacity: 1 });
    };

    const handleMouseLeave = () => {
      heartbreakControls.start({ opacity: 0 });
      heartControls.start({ opacity: 1 });
    };

    return (
      <ConfirmationModal
        dialogAction={() => unfavoriteTrack(track)}
        dialogActionText="Remove"
        dialogText={`Please confirm that you want to remove '${track.artists[0]?.name} - ${track.song.title}' from your Wishlist.`}
        dialogTitle="Remove favorite?"
      >
        <Button
          size="icon"
          className="w-8 border-none bg-transparent transition-all duration-300 hover:bg-transparent"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={heartbreakControls}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <CustomIcon icon="heartbreak" height="32px" width="32px" variant="primary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 1 }}
            animate={heartControls}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <CustomIcon icon="heart" height="32px" width="32px" variant="primary" />
          </motion.div>
        </Button>
      </ConfirmationModal>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div {...fadeInAndOut(0.2)} className="h-full w-full">
        {/* Loading */}
        {isLoading && <SkeletonTable hasHeader={false} tab="history" />}
        {/* Ready */}
        {!isLoading && !wishlistDataExists && (
          <NoDataMessage message="Your wishlist is empty! Add songs by clicking the heart icon on the results page." />
        )}
        {wishlistDataExists && (
          <TableBody hasHeader={false}>
            <>
              {data.map((wishlistedTrack, index) => (
                <TableRow
                  key={`${index}-${wishlistedTrack.song.id}`}
                  track={wishlistedTrack}
                  showDuration={true}
                  extraElement={<WishlistStatusIcon track={wishlistedTrack} />}
                />
              ))}
            </>
          </TableBody>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default WishlistTable;
