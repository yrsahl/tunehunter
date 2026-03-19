import ConditionalTooltip from "@/components/ConditonalTooltip";
import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import { useDisabledTabStore } from "@/hooks/stores/useDisabledTabStore";
import { formatDate, formatDuration } from "@/lib/formatters";
import { Track } from "@/types/song-types";
import { Album, Calendar, Clock, HeartIcon, Music, Play } from "lucide-react";
import { useSession } from "next-auth/react";
import SpotifyPlayIcon from "../Search/SearchTabContent/SpotifyPlayIcon";
import WishlistStatusIcon from "../Search/SearchTabContent/WishlistStatusIcon";
import SongPreviewFallback from "./SongPreviewFallback";
import SongPreviewSkeleton from "./SongPreviewSkeleton";

interface ISongPreviewProps {
  trackData: Track | undefined;
  isLoading: boolean;
}

export default function SongPreview({ trackData, isLoading }: ISongPreviewProps) {
  const { status } = useSession();
  const { spotifyConnected } = useSpotifyUserDataContext();
  const { setDisabledTabButtonHovered } = useDisabledTabStore();
  const loggedIn = status === "authenticated";

  console.log("songData", trackData);

  if (isLoading) {
    return <SongPreviewSkeleton />;
  }

  if (!trackData) {
    return <SongPreviewFallback />;
  }

  const { song, artists } = trackData;
  const { id, albumArtUrl, title, duration, album, year } = song;

  // Format artist names
  const artistNames = artists
    .map((artist) => artist.name)
    .reduce((acc, name, index) => {
      if (index === 0) return name;
      if (index === artists.length - 1) return `${acc} & ${name}`;
      return `${acc}, ${name}`;
    }, "");

  // Combine genres of artists
  const genres = artists
    .flatMap((artist) => artist.genres)
    .filter((genre, index, self) => genre && self.indexOf(genre) === index);

  return (
    <>
      {/* Mobile */}
      <div className="mx-auto block w-4/5 pb-2 text-center sm:pb-0 sm:pt-2 md:hidden">
        <h2 className="text-lg font-bold tracking-normal drop-shadow-sm sm:text-xl">{title}</h2>
        {artists.length > 0 && <span className="text-md sm:text-lg">By {artistNames}</span>}
      </div>
      {/* Medium and up */}
      <div className="my-auto hidden w-1/2 md:block">
        <div className="flex w-full flex-col gap-6 pl-2">
          {/* Top Row */}
          <div className="flex gap-8 rounded-3xl px-3 py-4 pl-4 drop-shadow-sm">
            {/* Art */}
            <figure className="h-48 w-48 flex-shrink-0 content-center overflow-hidden rounded-2xl drop-shadow-lg">
              {albumArtUrl && <img src={albumArtUrl} alt="Album cover art" className="h-48 w-48" />}
            </figure>
            <div className="flex flex-grow flex-col justify-evenly">
              <div className="flex flex-col gap-2 p-0">
                {/* Artist & Title */}
                <h2 className="text-lg font-bold tracking-normal drop-shadow-sm">{title}</h2>
                {artists.length > 0 && <p className="text-md">By {artistNames}</p>}
                {/* Play & Wishlist */}
                <div className="mt-3 flex items-center gap-3">
                  <ConditionalTooltip
                    active={spotifyConnected}
                    content="Sign in to add the song to play the song!"
                    disabledChild={
                      <div
                        className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full bg-slate-400"
                        onMouseEnter={() => setDisabledTabButtonHovered(true)}
                        onMouseLeave={() => setDisabledTabButtonHovered(false)}
                      >
                        <Play className="h-6 w-6 text-foreground" />
                      </div>
                    }
                  >
                    <SpotifyPlayIcon songId={id} />
                  </ConditionalTooltip>
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
                {genres.length > 0 ? (
                  genres.map((genre, index) => (
                    <span key={genre} className="capitalize">
                      {genre}
                      {index < genres.length - 1 ? ", " : ""}
                    </span>
                  ))
                ) : (
                  <span>Unknown</span>
                )}
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
    </>
  );
}
