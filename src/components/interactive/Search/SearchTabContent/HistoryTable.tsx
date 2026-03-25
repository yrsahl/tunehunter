import InfoWithToolTip from "@/components/InfoWithTooltip";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { formatDate } from "@/lib/formatters";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableRow from "./TableRow";

const HistoryTable = () => {
  const {
    history: { data, isLoading },
  } = useSearchTabDataContext();

  if (isLoading) return <SkeletonTable hasHeader={false} hasExtraElement />;

  const searchHistory = data?.searchHistory;

  if (!searchHistory?.length)
    return <NoDataMessage message="Your recent searches will appear here!" />;

  return (
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
                  tooltip={`Searched for on the ${formatDate(track.createdAt)}`}
                />
              }
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
