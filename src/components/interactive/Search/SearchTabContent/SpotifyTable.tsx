import IconButton from "@/components/IconButton";
import { MusicPlayingIndicator } from "@/components/Indicators";
import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const spotifySubTabs = ["recently_played", "queue", "most_played"] as const;
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
      {isLoading && <SkeletonTable hasHeader={true} tab="spotify" />}
      {!isLoading && (
        <AnimatePresence mode="wait">
          <motion.div key={activeSubTab} {...fadeInAndOut(0.2)} className="h-full w-full">
            {activeSubTab === "recently_played" && (
              <>
                {!recentlyPlayedDataExists && (
                  <NoDataMessage message="You haven't listened to anything on Spotify recently!" />
                )}
                {recentlyPlayedDataExists && (
                  <TableBody hasHeader={true}>
                    <>
                      {data.currentlyPlaying && (
                        <TableRow
                          track={data.currentlyPlaying}
                          showDuration={true}
                          extraElement={<MusicPlayingIndicator size={12} />}
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
                {!queueDataExists && <NoDataMessage message="Your queue is empty!" />}
                {queueDataExists && (
                  <TableBody hasHeader={true}>
                    <>
                      {data.queue?.map((queueTrack, index) => (
                        <TableRow
                          key={`${index}-${queueTrack.song.id}`}
                          track={queueTrack}
                          showDuration={true}
                          extraElement={index === 0 ? "Next" : `${index + 1}.`}
                        />
                      ))}
                    </>
                  </TableBody>
                )}
              </>
            )}
            {activeSubTab === "most_played" && (
              <>
                {!topTracksDataExists && (
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
                          extraElement={`${index + 1}.`}
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
