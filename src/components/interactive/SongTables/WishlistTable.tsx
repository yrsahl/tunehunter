import { LoadingIndicator } from "@/components/Indicators";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import TableRow from "../TableRows/TrendingTableRow";

const WishlistTable = ({}) => {
  const { status } = useSession();
  const loggedIn = status === "authenticated";
  const { data: wishlistEntries, isLoading } = api.song.getWishlist.useQuery(undefined, {
    enabled: loggedIn,
  });

  if (isLoading) {
    return (
      <div className="flex h-full justify-center">
        <LoadingIndicator size={60} />
      </div>
    );
  }
  if (wishlistEntries?.length == 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>Your wishlist is empty. Add songs by clicking the heart icon on the results page!</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full px-3 sm:px-5 md:px-7">
      <div className="hide-scrollbars relative h-full w-full overflow-scroll pb-6 pt-12">
        <table className="w-full">
          <tbody>
            {wishlistEntries?.map((wishlistEntry) => (
              <TableRow key={wishlistEntry.song.id} track={wishlistEntry.song} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WishlistTable;
