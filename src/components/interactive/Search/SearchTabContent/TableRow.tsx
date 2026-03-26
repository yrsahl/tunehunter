import IconButton from "@/components/IconButton";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import useDb from "@/hooks/useDb";
import useDeviceSize from "@/hooks/useDeviceSize";
import useSearch from "@/hooks/useSearch";
import useSpotifyTokens from "@/hooks/useSpotifyTokens";
import { api } from "@/lib/api";
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
  const { userAccessToken } = useSpotifyTokens();
  const { mutateAsync: storeSpotifyTrack } = api.song.storeSpotifyTrack.useMutation();

  const primaryArtist = track.artists[0]?.name || "";

  const handleSearchClick = async () => {
    let resolvedTrack: Track;

    if ("id" in track.song) {
      resolvedTrack = track as Track;
      if (!(await storeTracksInDb([resolvedTrack]))) return;
    } else {
      const artist = artists.map((a) => a.name).join(", ");
      const itunesTrack = await fetchItunesTrack(song.title, artist, song.duration);
      if (itunesTrack) {
        if (!(await storeTracksInDb([itunesTrack]))) return;
        resolvedTrack = itunesTrack;
      } else {
        const spotifyTrack = track as SpotifyTrack;
        if (!spotifyTrack.song.spotifyId) {
          toast.error("No results for this song.");
          return;
        }
        try {
          await storeSpotifyTrack({
            track: {
              spotifyId: spotifyTrack.song.spotifyId,
              title: spotifyTrack.song.title,
              duration: spotifyTrack.song.duration,
              album: spotifyTrack.song.album ?? null,
              albumArtUrl: spotifyTrack.song.albumArtUrl ?? null,
              year: spotifyTrack.song.year,
              previewUrl: spotifyTrack.song.previewUrl ?? null,
              isrc: spotifyTrack.song.isrc ?? null,
            },
            artists: spotifyTrack.artists.map((a) => ({ spotifyId: a.id, name: a.name })),
            accessToken: userAccessToken ?? undefined,
          });
        } catch {
          return;
        }
        resolvedTrack = {
          song: { ...spotifyTrack.song, id: `sp_${spotifyTrack.song.spotifyId}` },
          artists: spotifyTrack.artists.map((a) => ({ ...a, id: `sp_${a.id}` })),
        };
      }
    }

    submitSearch(resolvedTrack, region);
  };

  return (
    <motion.tr
      {...fadeInAndOut(0.3)}
      className={cn("max-h-16 overflow-hidden", isSmallDevice && "cursor-pointer")}
      whileTap={isSmallDevice ? { scale: 0.9 } : undefined}
      layout
      onClick={isSmallDevice ? () => handleSearchClick() : () => {}}
    >
      <td className="w-[56px] py-2 pr-4 sm:w-[84px] sm:pr-8">
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
      <td
        className={clsx(
          "align-middle",
          extraElement ? "w-0 pr-0 sm:w-12 sm:pr-5" : "w-0 pr-0 sm:w-0 sm:pr-0",
        )}
      >
        {!isSmallDevice && (
          <div className="-ml-2 flex justify-center text-sm sm:text-base">{extraElement}</div>
        )}
      </td>
      {/* Artist(s) */}
      <td className="w-[30%] min-w-0 pr-5 sm:w-[28%] sm:pr-6">
        <p className="w-full truncate text-sm sm:text-base">{primaryArtist}</p>
        {artists[1] && (
          <p className="w-full truncate text-sm text-muted-foreground sm:text-base">
            {artists[1].name}
          </p>
        )}
      </td>
      {/* Title */}
      <td className="w-[48%] min-w-0 pl-1 pr-2 sm:w-[52%] sm:pl-2 sm:pr-4">
        <span className="block w-full truncate text-sm sm:text-base">{song.title}</span>
      </td>
      {!isSmallDevice && (
        <>
          {/* Duration */}
          {showDuration && (
            <td className="w-[60px] pr-2 align-middle text-xs text-foreground/50 sm:pr-4 md:text-sm">
              <span>{new Date(song.duration).toISOString().substr(14, 5)}</span>
            </td>
          )}
          {/* Search */}
          {showSearch && (
            <td className="w-[96px] pl-2 text-right align-middle sm:pl-4">
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
