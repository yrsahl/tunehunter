import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const trendingSubTabs = ["today", "last_7_days", "last_30_days"] as const;
export type TrendingSubTab = (typeof trendingSubTabs)[number];

// Today, Week, Month
// Local, global
// Genre

const TrendingTable = () => {
  const {
    trending: { data, refetchData, isLoading },
  } = useSearchTabData();
  const [activeSubTab, setActiveSubTab] = useState<TrendingSubTab>(trendingSubTabs[0]);

  const trendingDataTodayExists = data?.today && data.today.length > 0;
  const trendingData7DaysExists = data?.last7Days && data.last7Days.length > 0;
  const trendingData30DaysExists = data?.last30Days && data.last30Days.length > 0;

  return (
    <>
      <TableHeader<TrendingSubTab>
        activeSubTab={activeSubTab}
        subTabs={trendingSubTabs}
        setActiveSubTab={setActiveSubTab}
      />
      {/* <div className="absolute right-8 top-3 z-10 cursor-pointer opacity-60">
        <IconButton
          icon="refresh"
          size="icon"
          iconSize="22px"
          variant="ghostPrimary"
          className="border-0"
          onClick={refetchData}
        />
      </div> */}
      {isLoading && <SkeletonTable hasHeader={true} tab="trending" />}
      {!isLoading && (
        <AnimatePresence mode="wait">
          <motion.div key={activeSubTab} {...fadeInAndOut(0.2)} className="h-full">
            {activeSubTab === "today" && (
              <>
                {trendingDataTodayExists ? (
                  <TableBody hasHeader={true}>
                    <>
                      {data?.today.map((trendingDailyTrack, index) => (
                        <TableRow
                          key={`${index}-${trendingDailyTrack.song.id}`}
                          track={trendingDailyTrack}
                          showDuration={true}
                          extraElement={`${index + 1}.`}
                        />
                      ))}
                    </>
                  </TableBody>
                ) : (
                  <NoDataMessage message="Nothing's trending right now..." />
                )}
              </>
            )}
            {activeSubTab === "last_7_days" && (
              <>
                {trendingData7DaysExists ? (
                  <TableBody hasHeader={true}>
                    <>
                      {data?.last7Days.map((trendingWeeklyTrack, index) => (
                        <TableRow
                          key={`${index}-${trendingWeeklyTrack.song.id}`}
                          track={trendingWeeklyTrack}
                          showDuration={true}
                          extraElement={`${index + 1}.`}
                        />
                      ))}
                    </>
                  </TableBody>
                ) : (
                  <NoDataMessage message="Nothing's trending the last 7 days..." />
                )}
              </>
            )}
            {activeSubTab === "last_30_days" && (
              <>
                {trendingData30DaysExists ? (
                  <TableBody hasHeader={true}>
                    <>
                      {data?.last30Days.map((trendingMonthlyTrack, index) => (
                        <TableRow
                          key={`${index}-${trendingMonthlyTrack.song.id}`}
                          track={trendingMonthlyTrack}
                          showDuration={true}
                          extraElement={`${index + 1}.`}
                        />
                      ))}
                    </>
                  </TableBody>
                ) : (
                  <NoDataMessage message="Nothing's trending the last 30 days..." />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default TrendingTable;
