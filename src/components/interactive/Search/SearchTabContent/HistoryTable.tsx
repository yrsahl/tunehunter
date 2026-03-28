import InfoWithToolTip from "@/components/InfoWithTooltip";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { formatDate } from "@/lib/formatters";
import { fadeIn } from "@/styles/animations";
import { motion } from "framer-motion";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableRow from "./TableRow";

const HistoryTable = () => {
  const {
    history: { data, isLoading },
  } = useSearchTabDataContext();

  const searchHistory = data?.searchHistory;

  return isLoading ? (
    <motion.div key="skeleton" {...fadeIn(0.3)} className="h-full w-full">
      <SkeletonTable hasHeader={false} hasExtraElement />
    </motion.div>
  ) : searchHistory?.length ? (
    <motion.div key="content" {...fadeIn(0.3)} className="h-full w-full">
      <div className="hide-scrollbars relative h-full w-full overflow-scroll overflow-x-hidden px-3 pb-4 pt-2 sm:px-5 sm:pt-4 md:px-7">
        <table className="w-full table-fixed">
          <tbody>
            {searchHistory.map((track, index) => (
              <TableRow
                key={`${index}-${track.song.id}`}
                track={track}
                showDuration
                extraElement={
                  <InfoWithToolTip
                    variant="primary"
                    tooltip={`Searched for on the ${formatDate(track.createdAt)} `}
                  />
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  ) : (
    <motion.div key="empty" {...fadeIn(0.2)} className="h-full w-full">
      <NoDataMessage message="Your recent searches will appear here!" />
    </motion.div>
  );
};

export default HistoryTable;
