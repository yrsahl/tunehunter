import InfoWithToolTip from "@/components/InfoWithTooltip";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import useDeviceSize from "@/hooks/useDeviceSize";
import { formatDate } from "@/lib/formatters";
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
  const { isSmallDevice } = useDeviceSize();

  const searchHistoryExists = data?.searchHistory && data?.searchHistory.length > 0;

  return (
    <>
      {isLoading && <SkeletonTable hasHeader={false} tab="history" />}
      {!isLoading && (
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
                      isSmallDevice ? (
                        <></>
                      ) : (
                        <InfoWithToolTip
                          tooltip={`Searched for on the ${formatDate(searchedTrack.createdAt)}`}
                        />
                      )
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
    </>
  );
};

export default HistoryTable;
