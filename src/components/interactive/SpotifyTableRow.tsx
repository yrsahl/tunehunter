import { SpotifyTrack } from "@/types/spotify";
import IconButton from "../IconButton";
import { MusicPlayingIndicator } from "../Indicators";

interface SpotifyTableRowProps {
  track: SpotifyTrack;
  currentlyPlaying?: boolean;
  userCountry?: string;
}

const SpotifyTableRow = ({ track, currentlyPlaying }: SpotifyTableRowProps) => {
  const startSearch = () => {
    console.log("searching...");
  };

  return (
    <tr className="max-h-16">
      <td className="py-2 pr-8">
        <a href={track.external_urls.spotify} target="_blank">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="mask mask-squircle h-12 w-12">
                <img src={track.album.images[0]?.url} />
              </div>
            </div>
            {currentlyPlaying && <MusicPlayingIndicator size={12} />}
          </div>
        </a>
      </td>
      <td className="max-h-16 overflow-hidden pr-4">
        <p>{track.artists[0]?.name}</p>
        {track.artists[1] && (
          <p className="overflow-ellipsis whitespace-nowrap text-muted-foreground">
            {track.artists[1]?.name}
          </p>
        )}
      </td>
      <td className="pr-4">
        <span>{track.name}</span>
      </td>
      <td className="text-right">
        <IconButton variant="primary" text="Search" size="sm" />
      </td>
    </tr>
  );
};

export default SpotifyTableRow;
