import { LoadingIndicator } from "@/components/Indicators";
import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import NoDataMessage from "./NoDataMessage";
import TableBody from "./TableBody";
import TableRow from "./TableRow";

const WishlistTable = () => {
  const {
    wishlist: { data, refetchData, isLoading },
  } = useSearchTabData();

  const wishlistDataExists = !!data && data.length > 0;

  return (
    <>
      {isLoading && (
        <div className="flex h-full justify-center">
          <LoadingIndicator size={60} />
        </div>
      )}
      {!isLoading && !wishlistDataExists && (
        <NoDataMessage message="Your wishlist is empty! Add songs by clicking the heart icon on the results page." />
      )}
      {wishlistDataExists && (
        <TableBody hasHeader={true}>
          <>
            {data.map((wishlistedTrack, index) => (
              <TableRow
                key={`${index}-${wishlistedTrack.song.id}`}
                track={wishlistedTrack}
                showDuration={true}
              />
            ))}
          </>
        </TableBody>
      )}
    </>
  );
};

export default WishlistTable;
