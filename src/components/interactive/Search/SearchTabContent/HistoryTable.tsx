import InfoWithToolTip from "@/components/InfoWithTooltip";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import { formatDate } from "@/helpers/format-date";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableBody from "./TableBody";
import TableRow from "./TableRow";

const historySubTabs = ["searches", "visits"] as const;
export type HistorySubTab = (typeof historySubTabs)[number];

const HistoryTable = () => {
  const {
    history: { data, refetchData, isLoading },
  } = useSearchTabDataContext();
  const [activeSubTab, setActiveSubTab] = useState<HistorySubTab>(historySubTabs[0]);

  const storeVisitHistoryExists = data?.storeVisitHistory && data?.storeVisitHistory.length > 0;
  const searchHistoryExists = data?.searchHistory && data?.searchHistory.length > 0;

  return (
    <>
      {/* <TableHeader<HistorySubTab>
        activeSubTab={activeSubTab}
        subTabs={historySubTabs}
        setActiveSubTab={setActiveSubTab}
        className="w-28"
      /> */}
      {isLoading && <SkeletonTable hasHeader={false} tab="history" />}
      {!isLoading && (
        <AnimatePresence mode="wait">
          <motion.div key={activeSubTab} {...fadeInAndOut(0.2)} className="h-full w-full">
            {activeSubTab === "searches" && (
              <>
                {searchHistoryExists ? (
                  <TableBody hasHeader={false}>
                    <>
                      {data?.searchHistory.map((searchedTrack, index) => (
                        <TableRow
                          key={`${index}-${searchedTrack.song.id}`}
                          track={searchedTrack}
                          showDuration={true}
                          extraElement={
                            <InfoWithToolTip
                              tooltip={`Searched for on the ${formatDate(searchedTrack.createdAt)}`}
                            />
                          }
                        />
                      ))}
                    </>
                  </TableBody>
                ) : (
                  <NoDataMessage message="Your recent searches will appear here!" />
                )}
              </>
            )}
            {activeSubTab === "visits" && (
              <>
                {storeVisitHistoryExists ? (
                  <TableBody hasHeader={true}>
                    <>
                      {data?.storeVisitHistory.map((visitedStoreTrack, index) => (
                        <TableRow
                          key={`${index}-${visitedStoreTrack.song.id}`}
                          track={visitedStoreTrack}
                          showDuration={true}
                          showSearch={false}
                          extraElement={
                            <>
                              <InfoWithToolTip
                                tooltip={`Visited on ${formatDate(visitedStoreTrack.createdAt)}`}
                              />
                              {/* <VendorLogo region={visitedStoreTrack.} store={"apple"} /> */}
                            </>
                          }
                        />
                      ))}
                    </>
                  </TableBody>
                ) : (
                  <NoDataMessage message="Your recent visits will appear here!" />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default HistoryTable;
