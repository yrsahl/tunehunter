import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import NoDataMessage from "./NoDataMessage";
import TableRow from "./TableRow";

const TrendingTable = () => {
  const {
    trending: { data, refetchData, isLoading },
  } = useSearchTabData();

  return (
    <>
      {!data && <NoDataMessage message="Nothing's trending right now..." />}
      {!!data && (
        <table className="w-full">
          <tbody>
            {data.map((trendingTrack) => (
              <TableRow key={trendingTrack.song.id} track={trendingTrack} showDuration={true} />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export default TrendingTable;
