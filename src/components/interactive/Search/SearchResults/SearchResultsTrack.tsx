import { formatDate } from "@/helpers/format-date";
import { formatDuration } from "@/helpers/format-duration";
import { AppRouter } from "@/server/api/root";
import { inferProcedureOutput } from "@trpc/server";
import { Calendar, Clock, Heart, Music, Play, User } from "lucide-react";
import SearchResultsTrackSkeleton from "./SearchResultsTrackSkeleton";

interface ISearchResultsTrackProps {
  songData: inferProcedureOutput<AppRouter["song"]["getSongAndArtistsBySongId"]> | undefined;
  isLoading: boolean;
}

export default function SearchResultsTrack({ songData, isLoading }: ISearchResultsTrackProps) {
  if (isLoading) {
    return <SearchResultsTrackSkeleton />;
  }

  if (!songData) {
    return <p>No data</p>;
  }

  const { albumArtUrl, title, duration, genre, artists, album, year } = songData;

  return (
    <div className="lg flex w-full flex-col gap-8 px-3">
      {/* Top Row */}
      <div className="flex gap-8">
        {/* Art */}
        <figure className="h-48 w-48 flex-shrink-0 content-center overflow-hidden rounded-3xl border-2 border-primary">
          {albumArtUrl && <img src={albumArtUrl} alt="Album cover art" className="h-48 w-48" />}
        </figure>
        <div className="flex flex-grow flex-col justify-evenly">
          <div className="flex flex-col gap-2 overflow-scroll p-0">
            {/* Artist & Title */}
            <h2 className="text-lg font-bold tracking-normal">{title}</h2>
            {artists.length > 0 && <p className="text-md">By {artists[0]?.name}</p>}

            {/* Play & Wishlist */}
            <div className="flex gap-2 ">
              <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                <Play className="h-6 w-6 text-foreground" />
              </div>
              <div className="mt-3 flex h-10 w-10 items-center justify-center rounded-full ">
                <Heart className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <span className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
            {album}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm">{formatDuration(duration)}</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
            Horizon Records
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm">{formatDate(new Date(year), true, true)}</span>
        </div>
      </div>
    </div>
  );
}
