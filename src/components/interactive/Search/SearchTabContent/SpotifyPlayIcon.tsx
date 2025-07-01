import { RedirectIndicator } from "@/components/Indicators";
import { pausePlayback, playTrack } from "@/helpers/spotify/play-spotify-song";
import useSpotifyPlayer from "@/hooks/useSpotifyPlayer";
import useSpotifyTokens from "@/hooks/useSpotifyTokens";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useState } from "react";

interface SpotifyPlayIconProps {
  songId: string;
}

const SpotifyPlayIcon = ({ songId }: SpotifyPlayIconProps) => {
  const { userAccessToken } = useSpotifyTokens();
  const { deviceId } = useSpotifyPlayer(userAccessToken);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!deviceId || !userAccessToken) return;
    setIsLoading(true);

    // Pause if playing
    if (isPlaying) {
      pausePlayback(deviceId, userAccessToken);
      setIsLoading(false);
      setIsPlaying(false);
      return;
    }

    // Resume
    if (playingSongId === songId) {
      await playTrack(deviceId, userAccessToken);
    }
    // Play from the start
    else {
      await playTrack(deviceId, userAccessToken, songId);
    }
    setPlayingSongId(songId);
    setIsPlaying(true);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <motion.div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
        <RedirectIndicator size={12} />
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 1 }}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary"
      disabled={!deviceId || !songId}
      onClick={handleClick}
    >
      {!isPlaying && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          <Play className="h-6 w-6 fill-foreground text-foreground" />
        </motion.span>
      )}
      {isPlaying && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          <Pause className="h-6 w-6 fill-foreground text-foreground" />
        </motion.span>
      )}
    </motion.button>
  );
};

export default SpotifyPlayIcon;
