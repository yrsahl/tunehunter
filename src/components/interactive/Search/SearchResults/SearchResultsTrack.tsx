import { formatDate } from "@/helpers/format-date";
import { formatDuration } from "@/helpers/format-duration";
import { AppRouter } from "@/server/api/root";
import { inferProcedureOutput } from "@trpc/server";
import { motion } from "framer-motion";
import { Album, Calendar, Clock, Music, Play } from "lucide-react";
import WishlistStatusIcon from "../SearchTabContent/WishlistStatusIcon";
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

  const { albumArtUrl, title, duration, artists, album, year } = songData;

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
    <div className="flex w-full flex-col gap-8 pl-2">
      {/* Top Row */}
      <div className="flex gap-8 rounded-3xl px-3 py-4 pl-4 shadow-sm shadow-foreground drop-shadow-sm dark:shadow-none">
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
            <div className="mt-3 flex gap-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 1 }}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary"
              >
                <Play className="h-6 w-6 text-foreground" />
              </motion.div>
              <WishlistStatusIcon songId={songData.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 px-4">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <p className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
            {genres.length > 0 ? (
              genres.map((genre, index) => (
                <span key={index} className="capitalize">
                  {genre}
                  {index < genres.length - 1 ? ", " : ""}
                </span>
              ))
            ) : (
              <span>Unknown</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm">{formatDuration(duration)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Album className="h-4 w-4 text-primary" />
          <span className="max-w-36 overflow-hidden text-ellipsis whitespace-nowrap text-sm">
            {album}
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
