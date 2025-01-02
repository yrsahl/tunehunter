import { LoadingIndicator } from "@/components/Indicators";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import TableRow from "../TableRow";

const HistoryTable = ({}) => {
  const { status } = useSession();
  const { t } = useTranslation();
  const loggedIn = status === "authenticated";
  const { data: historyEntries, isLoading } = api.song.getHistory.useQuery(undefined, {
    enabled: loggedIn,
  });

  if (isLoading) {
    return (
      <div className="flex h-full justify-center">
        <LoadingIndicator size={60} />
      </div>
    );
  }
  if (historyEntries?.length == 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>{t("search.tabs.history.empty")}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full px-3 sm:px-5 md:px-7">
      <div className="hide-scrollbars relative h-full w-full overflow-scroll pb-6 pt-12">
        <table className="w-full">
          <tbody>
            {historyEntries?.map((historyEntry, index) => (
              <TableRow key={`${historyEntry.song.id}/${index}`} track={historyEntry.song} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
