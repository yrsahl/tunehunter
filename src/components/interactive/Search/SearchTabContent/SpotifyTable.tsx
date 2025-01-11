import IconButton from "@/components/IconButton";
import { MusicPlayingIndicator } from "@/components/Indicators";
import { fadeInAndOut } from "@/helpers/animations";
import { SpotifyTabData } from "@/hooks/useSearchTabsData";
import { SpotifyTrack } from "@/types/spotify";
import { AnimatePresence, motion } from "framer-motion";
import { SearchSubTab } from "../SearchTabBar";

const SpotifyTabHeaderMap = {
  recently_played: "Recently Played",
  queue: "Queue",
  top_tracks: "Top Tracks",
};

interface SpotifyTabContentProps {
  data: SpotifyTabData;
  refetchData: () => void;
  activeTab?: SearchSubTab;
}

const SpotifyTable = ({ data, refetchData, activeTab }: SpotifyTabContentProps) => {
  interface SpotifyTableRowProps {
    track: SpotifyTrack;
    currentlyPlaying?: boolean;
  }
  const TableRow = ({ track, currentlyPlaying }: SpotifyTableRowProps) => (
    <tr className="max-h-16">
      <td className="py-2 pr-8">
        <a href={track.external_urls.spotify} target="_blank">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="mask mask-squircle h-12 w-12">
                <img src={track.album.images[0]?.url} />
              </div>
            </div>
            {currentlyPlaying && <MusicPlayingIndicator size={12} />}
          </div>
        </a>
      </td>
      <td className="max-h-16 overflow-hidden pr-4">
        <p>{track.artists[0]?.name}</p>
        {track.artists[1] && (
          <p className="overflow-ellipsis whitespace-nowrap text-muted-foreground">
            {track.artists[1]?.name}
          </p>
        )}
      </td>
      <td className="pr-4">
        <span>{track.name}</span>
      </td>
      <td className="text-right">
        <IconButton variant="primary" text="Search" size="sm" />
      </td>
    </tr>
  );

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
            {activeTab == "queue" &&
              data.queue?.queue.map((track, index) => (
                <TableRow key={`${track.id}/${index}`} track={track} />
              ))}
            {activeTab == "recently_played" && (
              <>
                {data.currentlyPlaying?.is_playing && (
                  <TableRow
                    key={data.currentlyPlaying.item.id}
                    track={data.currentlyPlaying.item}
                    currentlyPlaying={true}
                  />
                )}
                {data.recentlyPlayed?.items.map((track, index) => (
                  <TableRow key={`${track.track.id}/${index}`} track={track.track} />
                ))}
              </>
            )}
            {activeTab == "most_played" &&
              data.mostPlayed?.items.map((track) => <TableRow key={track.id} track={track} />)}
          </motion.tbody>
        </AnimatePresence>
      </table>
    </>
  );
};

export default SpotifyTable;
