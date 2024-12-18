import CustomIcon from "@/components/CustomIcon";
import { LoadingIndicator } from "@/components/Indicators";
import { api } from "@/utils/api";
import { useTranslation } from "react-i18next";
import { Tab } from "../Search/SearchTabs";
import TableRow from "../TableRow";

interface TrendingTableProps {
  setSearchTab: (tab: Tab | "") => void;
}

const TrendingTable = ({ setSearchTab }: TrendingTableProps) => {
  const { data: trendingEntries, isLoading } = api.song.getTrending.useQuery();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex h-full justify-center">
        <LoadingIndicator size={60} />
      </div>
    );
  }
  if (trendingEntries?.length == 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>{t("search.tabs.trending.empty")}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full px-3 sm:px-5 md:px-7">
      <button className="absolute right-0 top-0" onClick={() => setSearchTab("")}>
        <CustomIcon icon="x" variant="primary" height="24px" width="24px" />
      </button>
      <div className="hide-scrollbars relative h-full w-full overflow-scroll pb-6 pt-12">
        <table className="w-full">
          <tbody>
            {trendingEntries?.map((trendingEntry) => (
              <TableRow key={trendingEntry.song.id} track={trendingEntry.song} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrendingTable;
