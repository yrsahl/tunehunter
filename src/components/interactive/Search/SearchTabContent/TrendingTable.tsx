import RankingIndicator from "@/components/icons/RankingIndicator";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { fadeIn } from "@/styles/animations";
import { motion } from "framer-motion";
import { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const trendingSubTabs = ["today", "last_7_days", "last_30_days"] as const;
export type TrendingSubTab = (typeof trendingSubTabs)[number];
export const isTrendingSubTab = (value: string): value is TrendingSubTab =>
  trendingSubTabs.includes(value as TrendingSubTab);

const noDataMessages: Record<TrendingSubTab, string> = {
  today: "Nothing's trending right now...",
  last_7_days: "Nothing's trending the last 7 days...",
  last_30_days: "Nothing's trending the last 30 days...",
};

const TrendingTable = () => {
  const {
    trending: { data, isLoading },
  } = useSearchTabDataContext();
  const [activeSubTab, setActiveSubTab] = useState<TrendingSubTab>(trendingSubTabs[0]);

  const activeData = {
    today: data?.today,
    last_7_days: data?.last7Days,
    last_30_days: data?.last30Days,
  }[activeSubTab];

  return (
    <>
      <TableHeader<TrendingSubTab>
        activeSubTab={activeSubTab}
        subTabs={trendingSubTabs}
        setActiveSubTab={setActiveSubTab}
      />
      {isLoading ? (
        <motion.div key="skeleton" {...fadeIn(0.3)} className="h-full w-full">
          <SkeletonTable hasHeader hasExtraElement />
        </motion.div>
      ) : (
        <motion.div key={activeSubTab} {...fadeIn(0.3)} className="h-full w-full">
          {activeData?.length ? (
            <div className="hide-scrollbars relative h-full w-full overflow-scroll overflow-x-hidden px-3 pb-4 pt-8 sm:px-5 sm:pt-12 md:px-7 md:pt-12">
              <table className="w-full table-fixed">
                <tbody>
                  {activeData.map((track, index) => (
                    <TableRow
                      key={`${index}-${track.song.id}`}
                      track={track}
                      showDuration
                      extraElement={<RankingIndicator rank={index + 1} />}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <NoDataMessage message={noDataMessages[activeSubTab]} />
          )}
        </motion.div>
      )}
    </>
  );
};

export default TrendingTable;
