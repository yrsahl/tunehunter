import IconButton from "@/components/IconButton";
import RankingIndicator from "@/components/icons/RankingIndicator";
import { MusicPlayingIndicator } from "@/components/Indicators";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { fadeInAndOut } from "@/styles/animations";
import { AnimatePresence, motion } from "motion/react";
import { SkipForward } from "lucide-react";
import { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

const spotifySubTabs = ["recently_played", "queue", "most_played"] as const;
export type SpotifySubTab = (typeof spotifySubTabs)[number];

const noDataMessages: Record<SpotifySubTab, string> = {
  recently_played: "You haven't listened to anything on Spotify recently!",
  queue: "Your queue is empty!",
  most_played: "Songs you've played the most (in Spotify) will appear here!",
};

const SpotifyTable = () => {
  const {
    spotify: { data, refetchData, isLoading },
  } = useSearchTabDataContext();

  const [activeSubTab, setActiveSubTab] = useState<SpotifySubTab>(spotifySubTabs[0]);
  const [rotateAngleIcon, setRotateAngleIcon] = useState(0);

  const handleClick = () => {
    setRotateAngleIcon(rotateAngleIcon + 360);
    refetchData();
  };

  const activeData = {
    recently_played: data?.recentlyPlayed,
    queue: data?.queue,
    most_played: data?.topTracks,
  }[activeSubTab];

  const getExtraElement = (index: number) => {
    if (activeSubTab === "recently_played") return undefined;
    if (activeSubTab === "queue") return index === 0 ? <SkipForward size="16px" /> : `${index + 1}.`;
    return <RankingIndicator rank={index + 1} />;
  };

  return (
    <>
      <TableHeader<SpotifySubTab>
        activeSubTab={activeSubTab}
        subTabs={spotifySubTabs}
        setActiveSubTab={setActiveSubTab}
      />
      <motion.div
        className="absolute bottom-3 z-10 hidden cursor-pointer opacity-60 sm:bottom-auto sm:right-4 sm:top-3 sm:block md:right-8"
        animate={{ rotate: rotateAngleIcon }}
        onMouseEnter={() => setRotateAngleIcon(rotateAngleIcon + 15)}
        onMouseLeave={() => setRotateAngleIcon(rotateAngleIcon - 15)}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.3 }}
        onClick={handleClick}
      >
        <IconButton
          icon="refresh"
          size="icon"
          iconSize="22px"
          variant="ghostPrimary"
          className="border-0 bg-primary/10"
        />
      </motion.div>
      {isLoading ? (
        <SkeletonTable hasHeader hasExtraElement />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeSubTab} {...fadeInAndOut(0.2)} className="h-full w-full">
            {activeData?.length ? (
              <div className="hide-scrollbars relative h-full w-full overflow-scroll overflow-x-hidden px-3 pb-4 pt-8 sm:px-5 sm:pt-12 md:px-7 md:pt-12">
                <table className="w-full table-fixed">
                  <tbody>
                    {activeSubTab === "recently_played" && data?.currentlyPlaying && (
                      <TableRow
                        track={data.currentlyPlaying}
                        showDuration
                        extraElement={<MusicPlayingIndicator size={12} />}
                      />
                    )}
                    {activeData.map((track, index) => (
                      <TableRow
                        key={`${index}-${track.song.spotifyId}`}
                        track={track}
                        showDuration
                        extraElement={getExtraElement(index)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <NoDataMessage message={noDataMessages[activeSubTab]} />
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default SpotifyTable;
