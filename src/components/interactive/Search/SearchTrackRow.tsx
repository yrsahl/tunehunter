import { SpotifyTrack } from "@/types/spotify";
import { motion } from "framer-motion";

interface SpotifyTableRowProps {
  track: SpotifyTrack;
  userCountry?: string;
}

const SearchTrackRow = ({ track }: SpotifyTableRowProps) => {
  const trackDuration = new Date(track.duration_ms).toISOString().substr(14, 5);

  const startSearch = () => {
    console.log("searching...");
  };

  return (
    <motion.tr whileHover={{ scale: 1.05 }} className="cursor-pointer">
      <td className="py-2 pr-8">
        <a href={track.external_urls.spotify} target="_blank">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="mask mask-squircle h-9 w-9">
                <img src={track.album.images[0]?.url} />
              </div>
            </div>
          </div>
        </a>
      </td>
      <td className="max-h-12 overflow-hidden pr-4">
        <p>{track.artists[0]?.name}</p>
        {track.artists[1] && (
          <p className="overflow-ellipsis whitespace-nowrap text-muted-foreground">
            {track.artists[1]?.name}
          </p>
        )}
      </td>
      <td className="max-h-12 pr-4">
        <span>{track.name}</span>
      </td>
      <td className="text-right">{trackDuration}</td>
    </motion.tr>
  );
};

export default SearchTrackRow;
