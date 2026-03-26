import ConditionalTooltip from "@/components/ConditonalTooltip";
import { useDisabledTabStore } from "@/hooks/stores/useDisabledTabStore";
import useSpotifyPreviewUrl from "@/hooks/useSpotifyPreviewUrl";
import { formatDate, formatDuration } from "@/lib/formatters";
import { Track } from "@/types/song-types";
import { AnimatePresence, motion } from "framer-motion";
import { Album, Calendar, Clock, HeartIcon, Music } from "lucide-react";
import { useSession } from "next-auth/react";
import { memo } from "react";
import PreviewPlayButton from "../Search/SearchTabContent/PreviewPlayButton";
import WishlistStatusIcon from "../Search/SearchTabContent/WishlistStatusIcon";
import SongPreviewFallback from "./SongPreviewFallback";
import SongPreviewSkeleton from "./SongPreviewSkeleton";

interface ISongPreviewProps {
  trackData: Track | undefined;
  isLoading: boolean;
}

function SongPreview({ trackData, isLoading }: ISongPreviewProps) {
  const { status } = useSession();
  const { setDisabledTabButtonHovered } = useDisabledTabStore();
  const { previewUrl, isLoading: isLoadingPreview } = useSpotifyPreviewUrl(
    trackData?.song.spotifyId,
    trackData?.song.title,
    trackData?.artists[0]?.name,
    trackData?.song.previewUrl,
    trackData?.song.id,
  );
  const loggedIn = status === "authenticated";

  if (isLoading) {
    return <SongPreviewSkeleton />;
  }

  if (!trackData) {
    return <SongPreviewFallback />;
  }

  const { song, artists } = trackData;
  const { id, albumArtUrl, genre, title, duration, album, spotifyId, year } = song;

  // Format artist names
  const artistNames = artists
    .map((artist) => artist.name)
    .reduce((acc, name, index) => {
      if (index === 0) return name;
      if (index === artists.length - 1) return `${acc} & ${name}`;
      return `${acc}, ${name}`;
    }, "");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        className="md:my-auto md:w-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Mobile */}
        <div className="mx-auto block w-4/5 pb-2 text-center sm:pb-0 sm:pt-2 md:hidden">
          <h2 className="text-lg font-bold tracking-normal drop-shadow-sm sm:text-xl">{title}</h2>
          {artists.length > 0 && <span className="text-md sm:text-lg">By {artistNames}</span>}
        </div>
        {/* Medium and up */}
        <div className="hidden md:block">
          <div className="flex w-full flex-col gap-6 pl-2">
            {/* Top Row */}
            <div className="flex gap-8 rounded-3xl px-3 py-4 pl-4 drop-shadow-sm">
              {/* Art */}
              <figure className="h-48 w-48 flex-shrink-0 content-center overflow-hidden rounded-2xl drop-shadow-lg">
                {albumArtUrl ? (
                  <img src={albumArtUrl} alt="Album cover art" className="h-48 w-48" />
                ) : (
                  <figure className="h-48 w-48 flex-shrink-0 content-center overflow-hidden rounded-2xl bg-muted drop-shadow-lg" />
                )}
              </figure>
              <div className="flex flex-grow flex-col justify-evenly">
                <div className="flex flex-col gap-2 p-0">
                  {/* Artist & Title */}
                  <h2 className="text-lg font-bold tracking-normal drop-shadow-sm">{title}</h2>
                  {artists.length > 0 && <p className="text-md">By {artistNames}</p>}
                  {/* Play & Wishlist */}
                  <div className="mt-3 flex items-center gap-3">
                    <PreviewPlayButton
                      spotifyId={spotifyId}
                      previewUrl={previewUrl}
                      isLoadingPreview={isLoadingPreview}
                    />
                    <ConditionalTooltip
                      active={loggedIn}
                      content="Sign in to add the song to your wishlist!"
                      disabledChild={
                        <div
                          className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full"
                          onMouseEnter={() => setDisabledTabButtonHovered(true)}
                          onMouseLeave={() => setDisabledTabButtonHovered(false)}
                        >
                          <HeartIcon className="h-7 w-7 text-foreground" />
                        </div>
                      }
                    >
                      <WishlistStatusIcon songId={id} />
                    </ConditionalTooltip>
                  </div>
                </div>
              </div>
            </div>
            {/* Details */}
            <div className="grid grid-cols-2 gap-4 px-4">
              <div className="flex items-center gap-3">
                <Music className="h-4 w-4 text-primary" />
                <p className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                  {genre ?? "—"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm">{formatDuration(duration)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Album className="h-4 w-4 text-primary" />
                <span className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                  {album}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm">{formatDate(new Date(year), true, true)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(SongPreview);
