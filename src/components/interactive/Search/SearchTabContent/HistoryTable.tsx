import { LoadingIndicator } from "@/components/Indicators";
import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const historySubTabs = ["searches", "purchases"] as const;
export type HistorySubTab = (typeof historySubTabs)[number];

const HistoryTable = () => {
  const {
    history: { data, refetchData, isLoading },
  } = useSearchTabData();
  const [activeSubTab, setActiveSubTab] = useState<HistorySubTab>(historySubTabs[0]);

  const purchaseHistoryExists = data?.purchaseHistory && data?.purchaseHistory.length > 0;
  const searchHistoryExists = data?.searchHistory && data?.searchHistory.length > 0;

  return (
    <>
      <TableHeader<HistorySubTab>
        activeSubTab={activeSubTab}
        subTabs={historySubTabs}
        setActiveSubTab={setActiveSubTab}
      />
      {isLoading && (
        <div className="flex h-full justify-center">
          <LoadingIndicator size={60} />
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={activeSubTab} {...fadeInAndOut(0.2)} className="h-full">
          {activeSubTab === "purchases" && (
            <>
              {!isLoading && !purchaseHistoryExists ? (
                <NoDataMessage message="Your recent purchases will appear here!" />
              ) : (
                <TableBody hasHeader={true}>
                  <>
                    {data?.purchaseHistory.map((purchasedTrack, index) => (
                      <TableRow
                        key={`${index}-${purchasedTrack.song.id}`}
                        track={purchasedTrack}
                        showDuration={true}
                      />
                    ))}
                  </>
                </TableBody>
              )}
            </>
          )}
          {activeSubTab === "searches" && (
            <>
              {!isLoading && !searchHistoryExists ? (
                <NoDataMessage message="Your recent searches will appear here!" />
              ) : (
                <TableBody hasHeader={true}>
                  <>
                    {data?.searchHistory.map((searchedTrack, index) => (
                      <TableRow
                        key={`${index}-${searchedTrack.song.id}`}
                        track={searchedTrack}
                        showDuration={true}
                      />
                    ))}
                  </>
                </TableBody>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default HistoryTable;
