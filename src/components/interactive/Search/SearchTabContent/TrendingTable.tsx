import { LoadingIndicator } from "@/components/Indicators";
import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const trendingSubTabs = ["for_you", "local", "global"] as const;
export type TrendingSubTab = (typeof trendingSubTabs)[number];

const TrendingTable = () => {
  const {
    trending: { data, refetchData, isLoading },
  } = useSearchTabData();
  const [activeSubTab, setActiveSubTab] = useState<TrendingSubTab>(trendingSubTabs[0]);

  const forYouTrendingDataExists = true;
  const localTrendingDataExists = true;
  const globalTrendingDataExists = true;

  return (
    <>
      <TableHeader<TrendingSubTab>
        activeSubTab={activeSubTab}
        subTabs={trendingSubTabs}
        setActiveSubTab={setActiveSubTab}
        className="w-24"
      />
      {isLoading && (
        <div className="flex h-full justify-center">
          <LoadingIndicator size={60} />
        </div>
      )}
      {activeSubTab === "for_you" && (
        <>
          {!isLoading && !forYouTrendingDataExists ? (
            <NoDataMessage message="XXX" />
          ) : (
            <TableBody hasHeader={true}>
              <>
                {data?.map((purchasedTrack, index) => (
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
      {activeSubTab === "local" && (
        <>
          {!isLoading && !localTrendingDataExists ? (
            <NoDataMessage message="XXX" />
          ) : (
            <TableBody hasHeader={true}>
              <>
                {data?.map((purchasedTrack, index) => (
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
      {activeSubTab === "global" && (
        <>
          {!isLoading && !globalTrendingDataExists ? (
            <NoDataMessage message="XXX" />
          ) : (
            <TableBody hasHeader={true}>
              <>
                {data?.map((purchasedTrack, index) => (
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
    </>
  );
};

export default TrendingTable;
