import IconButton from "@/components/IconButton";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import useDeviceSize from "@/hooks/useDeviceSize";
import useSearch from "@/hooks/useSearch";
import { fadeInAndOut } from "@/styles/animations";
import { Track } from "@/types/song-types";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface TableRowProps {
  track: Track;
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

  const primaryArtist = artists[0]?.name || "";

  const handleSearchClick = async () => {
    // Start search
    submitSearch(song.id, region, song.title, primaryArtist);
  };

  return (
    <motion.tr {...fadeInAndOut(0.3)} className="max-h-16" layout>
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
      <td className={clsx("align-middle", extraElement ? "pr-2 sm:pr-4" : "pr-0")}>
        <div className="flex text-sm md:text-base">{extraElement}</div>
      </td>
      {/* Artist(s) */}
      <td className="pr-3 sm:pr-4">
        <p className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap text-sm md:text-base">
          {primaryArtist}
        </p>
        {artists[1] && (
          <p className="max-w-28 overflow-hidden text-ellipsis whitespace-nowrap text-sm text-muted-foreground md:text-base">
            {artists[1].name}
          </p>
        )}
      </td>
      {/* Title */}
      <td className="pr-2 sm:pr-4">
        <span className="block max-w-48 overflow-hidden text-ellipsis whitespace-nowrap text-sm md:text-base">
          {song.title}
        </span>
      </td>
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
            variant="primary"
            text="Search"
            size={buttonSize}
            textStyle="uppercase text-xs"
            onClick={handleSearchClick}
          />
        </td>
      )}
    </motion.tr>
  );
};

export default TableRow;
