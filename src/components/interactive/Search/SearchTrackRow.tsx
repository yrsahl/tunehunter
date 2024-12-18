import { SpotifyTrack } from "@/types/spotify";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";

interface SpotifyTableRowProps {
  track: SpotifyTrack;
  userCountry?: string;
}

const SearchTrackRow = ({ track }: SpotifyTableRowProps) => {
  const trackDuration = new Date(track.duration_ms).toISOString().substr(14, 5);
  const router = useRouter();

  const trackSearchHref = {
    pathname: router.pathname,
    query: { ...router.query, id: track.id },
  };

  const startSearch = () => {
    console.log("searching...");
  };

  return (
    <motion.tr whileHover={{ scale: 1.05 }} className="cursor-pointer">
      <Link href={trackSearchHref} className="contents">
        <td className="py-3 pr-8">
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
        <td className="overflow-hidden pr-4 align-middle">
          <p>{track.artists[0]?.name}</p>
          {track.artists[1] && (
            <p className="overflow-ellipsis whitespace-nowrap text-muted-foreground">
              {track.artists[1]?.name}
            </p>
          )}
        </td>
        <td className="pr-4 align-middle">
          <span>{track.name}</span>
        </td>
        <td className="text-right align-middle">{trackDuration}</td>
      </Link>
    </motion.tr>
  );
};

export default SearchTrackRow;
