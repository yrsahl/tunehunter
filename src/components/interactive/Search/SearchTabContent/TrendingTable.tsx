import { LoadingIndicator } from "@/components/Indicators";
import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import TableBody from "./TableBody";
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
      {/* <TableHeader<TrendingSubTab>
        activeSubTab={activeSubTab}
        subTabs={trendingSubTabs}
        setActiveSubTab={setActiveSubTab}
        className="w-24"
      /> */}
      {isLoading && (
        <div className="flex h-full justify-center">
          <LoadingIndicator size={60} />
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div key={activeSubTab} {...fadeInAndOut(0.2)} className="h-full">
          {activeSubTab === "for_you" && (
            <>
              {!isLoading && !forYouTrendingDataExists ? (
                <NoDataMessage message="XXX" />
              ) : (
                <TableBody hasHeader={false}>
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
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default TrendingTable;

// {activeSubTab === "for_you" && (
//   <motion.div key={activeSubTab} {...fadeInAndOut(0.15)}>
//     {!isLoading && !forYouTrendingDataExists ? (
//       <NoDataMessage message="XXX" />
//     ) : (
//       <TableBody hasHeader={true}>
//         <>
//           {data?.map((purchasedTrack, index) => (
//             <TableRow
//               key={`${index}-${purchasedTrack.song.id}`}
//               track={purchasedTrack}
//               showDuration={true}
//             />
//           ))}
//         </>
//       </TableBody>
//     )}
//   </motion.div>
// )}
// {activeSubTab === "local" && (
//   <motion.div key={activeSubTab} {...fadeInAndOut(0.15)}>
//     {!isLoading && !localTrendingDataExists ? (
//       <NoDataMessage message="XXX" />
//     ) : (
//       <TableBody hasHeader={true}>
//         <>
//           {data?.map((purchasedTrack, index) => (
//             <TableRow
//               key={`${index}-${purchasedTrack.song.id}`}
//               track={purchasedTrack}
//               showDuration={true}
//             />
//           ))}
//         </>
//       </TableBody>
//     )}
//   </motion.div>
// )}
// {activeSubTab === "global" && (
//   <motion.div key={activeSubTab} {...fadeInAndOut(0.15)}>
//     {!isLoading && !globalTrendingDataExists ? (
//       <NoDataMessage message="XXX" />
//     ) : (
//       <TableBody hasHeader={true}>
//         <>
//           {data?.map((purchasedTrack, index) => (
//             <TableRow
//               key={`${index}-${purchasedTrack.song.id}`}
//               track={purchasedTrack}
//               showDuration={true}
//             />
//           ))}
//         </>
//       </TableBody>
//     )}
