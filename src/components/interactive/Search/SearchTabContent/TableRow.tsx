import IconButton from "@/components/IconButton";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import useDb from "@/hooks/useDb";
import useDeviceSize from "@/hooks/useDeviceSize";
import useSearch from "@/hooks/useSearch";
import { cn } from "@/lib/utils";
import { fetchItunesTrack } from "@/services/itunes/api";
import { fadeInAndOut } from "@/styles/animations";
import { SpotifyTrack, Track } from "@/types/song-types";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import { toast } from "sonner";

interface TableRowProps {
  track: Track | SpotifyTrack;
  showDuration?: boolean;
  showSearch?: boolean;
  extraElement?: ReactNode;
}

const TableRow = ({
  track,
  showDuration = false,
  showSearch = true,
  extraElement,
}: TableRowProps) => {
  const { submitSearch } = useSearch();
  const { song, artists } = track;
  const { region } = useRegionSettings();
  const { isSmallDevice } = useDeviceSize();
  const buttonSize = isSmallDevice ? "xs" : "sm";
  const { storeTracksInDb } = useDb();

  const primaryArtist = track.artists[0]?.name || "";

  const handleSearchClick = async () => {
    let resolvedTrack: Track;

    if ("id" in track.song) {
      resolvedTrack = track as Track;
    } else {
      const artist = artists.map((a) => a.name).join(", ");
      const query = `${artist} - ${song.title}`;
      const iTunesTrack = await fetchItunesTrack(query, song.duration);
      if (!iTunesTrack) {
        toast.error("Song not found");
        return;
      }
      await storeTracksInDb([iTunesTrack]);
      resolvedTrack = iTunesTrack;
    }

    submitSearch(resolvedTrack, region);
  };

  return (
    <motion.tr
      {...fadeInAndOut(0.3)}
      className={cn("max-h-16 overflow-hidden", isSmallDevice && "cursor-pointer")}
      layout
      onClick={isSmallDevice ? () => handleSearchClick() : () => {}}
    >
      <td className="py-2 pr-4 sm:pr-8">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="mask mask-squircle h-10 w-10 md:h-12 md:w-12">
              {song.albumArtUrl && <img src={song.albumArtUrl} />}
              {!song.albumArtUrl && (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
      {/* Extra Element */}
      <td className={clsx("align-middle", extraElement ? "pr-2 sm:pr-5" : "pr-0")}>
        {!isSmallDevice && (
          <div className="-ml-2 flex justify-center text-sm sm:text-base">{extraElement}</div>
        )}
      </td>
      {/* Artist(s) */}
      <td className="pr-3 sm:pr-4">
        <p className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap text-sm sm:text-base">
          {primaryArtist}
        </p>
        {artists[1] && (
          <p className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted-foreground sm:text-base">
            {artists[1].name}
          </p>
        )}
      </td>
      {/* Title */}
      <td className="pr-2 sm:pr-4">
        <span className="block max-w-48 overflow-hidden text-ellipsis break-words text-sm sm:text-base">
          {song.title}
        </span>
      </td>
      {!isSmallDevice && (
        <>
          {/* Duration */}
          {showDuration && (
            <td className="pr-2 align-middle text-xs text-foreground/50 sm:pr-4 md:text-sm">
              <span>{new Date(song.duration).toISOString().substr(14, 5)}</span>
            </td>
          )}
          {/* Search */}
          {showSearch && (
            <td className="pl-2 text-right align-middle sm:pl-4">
              <IconButton
                variant="outlinePrimary"
                text="Search"
                size={buttonSize}
                textStyle="uppercase text-xs"
                onClick={handleSearchClick}
              />
            </td>
          )}
        </>
      )}
    </motion.tr>
  );
};

export default TableRow;
