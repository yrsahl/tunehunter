import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import useSpotifyPreviewUrl from "@/hooks/useSpotifyPreviewUrl";
import { formatDate, formatDuration } from "@/lib/formatters";
import { Track } from "@/types/song-types";
import { AnimatePresence, motion } from "motion/react";
import { Album, Calendar, Clock, HeartIcon, Music } from "lucide-react";
import { useSession } from "next-auth/react";
import { memo } from "react";
import { toast } from "sonner";
import PreviewPlayButton from "../Search/SearchTabContent/PreviewPlayButton";
import FavoritesStatusIcon from "../Search/SearchTabContent/FavoritesStatusIcon";
import SongPreviewFallback from "./SongPreviewFallback";
import SongPreviewSkeleton from "./SongPreviewSkeleton";

interface ISongPreviewProps {
  trackData: Track | undefined;
  isLoading: boolean;
}

function SongPreview({ trackData, isLoading }: ISongPreviewProps) {
  const { status } = useSession();
  const router = useRouterWithHelpers();
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
                    {loggedIn ? (
                      <FavoritesStatusIcon songId={id} />
                    ) : (
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                        onClick={() =>
                          toast.info("Sign in to save your favorites.", {
                            action: {
                              label: "Sign in",
                              onClick: () => router.setParams({ profile: "login" }),
                            },
                            classNames: {
                              actionButton:
                                "!bg-primary !text-primary-foreground hover:!bg-primary/80",
                            },
                          })
                        }
                      >
                        <HeartIcon className="h-7 w-7 text-foreground" />
                      </button>
                    )}
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
