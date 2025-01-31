import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { SearchSubTab } from "../SearchTabBar";
import NoDataMessage from "./NoDataMessage";
import TableRow from "./TableRow";

interface HistoryTabContentProps {
  activeTab?: SearchSubTab;
}

const HistoryTable = ({ activeTab }: HistoryTabContentProps) => {
  const {
    history: { data, refetchData, isLoading },
  } = useSearchTabData();

  const purchaseHistoryExists = data?.purchaseHistory && data?.purchaseHistory.length > 0;
  const searchHistoryExists = data?.searchHistory && data?.searchHistory.length > 0;

  return (
    <>
      {activeTab === "searches" && (
        <>
          {!searchHistoryExists && (
            <NoDataMessage message="Your recent searches will appear here!" />
          )}
          {searchHistoryExists && (
            <table className="w-full">
              <tbody>
                {data?.searchHistory.map((searchedTrack, index) => (
                  <TableRow key={`${index}-${searchedTrack.song.id}`} track={searchedTrack} />
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
      {activeTab === "purchases" && (
        <>
          {!purchaseHistoryExists && (
            <NoDataMessage message="Your recent purchases will appear here!" />
          )}
          {purchaseHistoryExists && (
            <table className="w-full">
              <tbody>
                {data?.purchaseHistory.map((purchasedTrack, index) => (
                  <TableRow key={`${index}-${purchasedTrack.song.id}`} track={purchasedTrack} />
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </>
  );
};

export default HistoryTable;
