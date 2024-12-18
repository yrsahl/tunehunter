import { LoadingIndicator } from "@/components/Indicators";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import TableRow from "../TableRow";
import LoginPromptMockTable from "./LoginPromptMockTable";

const WishlistTable = ({}) => {
  const { status } = useSession();
  const { t } = useTranslation();
  const loggedIn = status === "authenticated";
  const { data: wishlistEntries, isLoading } = api.song.getWishlist.useQuery(undefined, {
    enabled: loggedIn,
  });

  if (!loggedIn) {
    return <LoginPromptMockTable promptText={t("auth.prompts.wishlist")} icon="userBold" />;
  }
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
        <p>{t("search.tabs.wishlist.empty")}</p>
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
