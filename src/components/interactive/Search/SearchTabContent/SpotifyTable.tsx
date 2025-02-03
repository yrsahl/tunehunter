import IconButton from "@/components/IconButton";
import { LoadingIndicator } from "@/components/Indicators";
import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const spotifySubTabs = ["recently_played", "queue", "top_tracks"] as const;
export type SpotifySubTab = (typeof spotifySubTabs)[number];

const SpotifyTable = () => {
  const {
    spotify: { data, refetchData, isLoading },
  } = useSearchTabData();

  const [activeSubTab, setActiveSubTab] = useState<SpotifySubTab>(spotifySubTabs[0]);

  const recentlyPlayedDataExists = data?.recentlyPlayed && data?.recentlyPlayed?.length > 0;
  const queueDataExists = data?.queue && data?.queue?.length > 0;
  const topTracksDataExists = data?.topTracks && data?.topTracks?.length > 0;

  return (
    <>
      <TableHeader<SpotifySubTab>
        activeSubTab={activeSubTab}
        subTabs={spotifySubTabs}
        setActiveSubTab={setActiveSubTab}
      />
      <div className="absolute right-8 top-3 z-10 cursor-pointer opacity-60">
        <IconButton
          icon="refresh"
          size="icon"
          iconSize="22px"
          variant="ghostPrimary"
          className="border-0"
          onClick={refetchData}
        />
      </div>
      {isLoading && (
        <div className="flex h-full justify-center">
          <LoadingIndicator size={60} />
        </div>
      )}
      {!isLoading && (
        <AnimatePresence mode="wait">
          <motion.div key={activeSubTab} {...fadeInAndOut(0.2)} className="h-full">
            {activeSubTab === "recently_played" && (
              <>
                {!isLoading && !recentlyPlayedDataExists && (
                  <NoDataMessage message="You haven't listened to anything on Spotify recently!" />
                )}
                {recentlyPlayedDataExists && (
                  <TableBody hasHeader={true}>
                    <>
                      {data.currentlyPlaying && (
                        <TableRow
                          track={data.currentlyPlaying}
                          showDuration={true}
                          showCurrentlyPlaying={true}
                        />
                      )}
                      {data.recentlyPlayed?.map((recentlyPlayedTrack, index) => (
                        <TableRow
                          key={`${index}-${recentlyPlayedTrack.song.id}`}
                          track={recentlyPlayedTrack}
                          showDuration={true}
                        />
                      ))}
                    </>
                  </TableBody>
                )}
              </>
            )}
            {activeSubTab === "queue" && (
              <>
                {!isLoading && !queueDataExists && <NoDataMessage message="Your queue is empty!" />}
                {queueDataExists && (
                  <TableBody hasHeader={true}>
                    <>
                      {data.queue?.map((queueTrack, index) => (
                        <TableRow
                          key={`${index}-${queueTrack.song.id}`}
                          track={queueTrack}
                          showDuration={true}
                        />
                      ))}
                    </>
                  </TableBody>
                )}
              </>
            )}
            {activeSubTab === "top_tracks" && (
              <>
                {!isLoading && !topTracksDataExists && (
                  <NoDataMessage message="Songs you've played the most (in Spotify) will appear here!" />
                )}
                {topTracksDataExists && (
                  <TableBody hasHeader={true}>
                    <>
                      {data.topTracks?.map((topTrack, index) => (
                        <TableRow
                          key={`${index}-${topTrack.song.id}`}
                          track={topTrack}
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
      )}
    </>
  );
};

export default SpotifyTable;

// {

//   {activeSubTab === "recently_played" && (
//     <>
//       {!isLoading && !localTrendingDataExists ? (
//         <NoDataMessage message="Your queue is empty!" />
//       ) : (
//         <TableBody hasHeader={true}>
//           <>
//             {data?.map((purchasedTrack, index) => (
//               <TableRow
//                 key={`${index}-${purchasedTrack.song.id}`}
//                 track={purchasedTrack}
//                 showDuration={true}
//               />
//             ))}
//           </>
//         </TableBody>
//       )}
//     </>
//   )}
//   {activeSubTab === "top_tracks" && (
//     <>
//       {!isLoading && !globalTrendingDataExists ? (
//         <NoDataMessage message="Songs you've played the most (in Spotify) will appear here!" />
//       ) : (
//         <TableBody hasHeader={true}>
//           <>
//             {data?.map((purchasedTrack, index) => (
//               <TableRow
//                 key={`${index}-${purchasedTrack.song.id}`}
//                 track={purchasedTrack}
//                 showDuration={true}
//               />
//             ))}
//           </>
//         </TableBody>
//       )}
//     </>
/* <>
<div className="absolute right-8 top-3 z-10 cursor-pointer opacity-60">
  <IconButton
    icon="refresh"
    size="icon"
    iconSize="22px"
    variant="ghostPrimary"
    className="border-0"
    onClick={refetchData}
  />
</div>
<table className="w-full">
  <AnimatePresence mode="wait">
    <motion.tbody key={activeTab} {...fadeInAndOut(0.15)}>
      {activeTab == "recently_played" && (
        <>
          {spotifyData.currentlyPlaying?.is_playing && (
            <TableRow
              key={spotifyData.currentlyPlaying.item.id}
              track={spotifyData.currentlyPlaying.item}
              currentlyPlaying={true}
            />
          )}
          {spotifyData.recentlyPlayed?.items.map((track, index) => (
            <TableRow key={`${track.track.id}/${index}`} track={track.track} />
          ))}
        </>
      )}
      {activeTab == "queue" &&
        spotifyData.queue?.queue.map((track, index) => (
          <TableRow key={`${track.id}/${index}`} track={track} />
        ))}
      {activeTab == "most_played" &&
        spotifyData.mostPlayed?.items.map((track) => (
          <TableRow key={track.id} track={track} />
        ))}
    </motion.tbody>
  </AnimatePresence>
</table>
</> */
