import { LoadingIndicatorTwo } from "@/components/Indicators";
import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import { useEventEmitter } from "@/hooks/useEventEmitter";
import useSpotifyPlayer from "@/hooks/useSpotifyPlayer";
import { SpotifyPlaybackStateShort } from "@/types/spotify-playback";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface SpotifyPlayIconProps {
  songId: string;
  duration: number;
}

const SpotifyPlayIcon = ({ songId, duration }: SpotifyPlayIconProps) => {
  const { spotifyConnected } = useSpotifyUserDataContext();
  const { startPlayback, pausePlayback, resumePlayback } = useSpotifyPlayer();
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { eventData } = useEventEmitter<{ data: SpotifyPlaybackStateShort }>(
    "spotify-player-state-changed",
  );

  // Handle Button click
  const handleClick = async () => {
    setIsLoading(true);

    // Pause if playing
    if (isPlaying) {
      pausePlayback();
      setIsLoading(false);
      setIsPlaying(false);
      return;
    }

    // Resume
    if (playingSongId === songId) {
      await resumePlayback();
    }
    // Play from the start
    else {
      await startPlayback(songId);
    }
    setPlayingSongId(songId);
    setIsPlaying(true);
    setIsLoading(false);
  };

  // Update UI with Spotify Player State
  useEffect(() => {
    if (!eventData) return;
    const { data } = eventData;

    setIsLoading(data.isLoading);
    setIsPlaying(data.isPlaying);

    // When the song ends, stop playback
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (data.isPlaying) {
      const timeLeft = data.duration - data.position;
      timeoutId = setTimeout(() => {
        setIsLoading(false);
        setIsPlaying(false);
      }, timeLeft);
    }

    // Cleanup
    return () => {
      if (timeoutId !== null) clearTimeout(timeoutId);
    };
  }, [eventData]);

  if (isLoading) {
    return (
      <motion.div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
        <LoadingIndicatorTwo size={28} />
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 1 }}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary"
      disabled={!spotifyConnected || !songId}
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
          className="relative flex"
        >
          <span className="animate-pulse-shadow absolute inset-0 z-0 rounded-full" />
          <Pause className="relative z-10 h-6 w-6 fill-foreground text-foreground" />
        </motion.span>
      )}
    </motion.button>
  );
};

export default SpotifyPlayIcon;
