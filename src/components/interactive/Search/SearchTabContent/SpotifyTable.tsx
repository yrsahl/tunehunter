import IconButton from "@/components/IconButton";
import { TableRow } from "@/components/ui/table";
import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import { AnimatePresence, motion } from "framer-motion";
import { SearchSubTab } from "../SearchTabBar";

const SpotifyTabHeaderMap = {
  recently_played: "Recently Played",
  queue: "Queue",
  top_tracks: "Top Tracks",
};

interface SpotifyTabContentProps {
  activeTab?: SearchSubTab;
}

const SpotifyTable = ({ activeTab }: SpotifyTabContentProps) => {
  const {
    spotify: { data, refetchData, isLoading },
  } = useSearchTabData();

  const spotifyData = data!; // Must exist due to checks in parent SearchTabContent

  return (
    <>
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
    </>
  );
};

export default SpotifyTable;
