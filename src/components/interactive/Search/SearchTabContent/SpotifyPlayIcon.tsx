import { LoadingIndicatorTwo } from "@/components/Indicators";
import { useSpotifyPlayerContext } from "@/contexts/SpotifyPlayerContext";
import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import { useEventEmitter } from "@/hooks/useEventEmitter";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { SpotifyPlaybackStateShort } from "@/types/spotify-playback-types";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface SpotifyPlayIconProps {
  songId: string;
}

const SpotifyPlayIcon = ({ songId }: SpotifyPlayIconProps) => {
  const { spotifyConnected } = useSpotifyUserDataContext();
  const { startPlayback, pausePlayback, resumePlayback } = useSpotifyPlayerContext();
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouterWithHelpers();
  const { eventData: spotifyPlaybackState } = useEventEmitter<{ data: SpotifyPlaybackStateShort }>(
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

  // Synchronize with URL params
  useEffect(() => {
    if (!router.isReady) return;
    const isPlaying = router.getParams("isPlaying");

    // Page refresh -> isPlaying was set -> Resume
    if (!!isPlaying && isPlaying === "true") {
      if (!isPlaying) resumePlayback();
      return;
    }

    // New page -> isPlaying was not set -> Nothing/Stop
    pausePlayback();
  }, [router.isReady, router.query]);

  // Update UI with Spotify Player State
  useEffect(() => {
    if (!spotifyPlaybackState) return;
    const { data } = spotifyPlaybackState;

    setIsLoading(data.isLoading);
    setIsPlaying(data.isPlaying);
    if (data.isPlaying) router.setParams({ isPlaying: "true" });

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
  }, [spotifyPlaybackState]);

  if (isLoading) {
    return (
      <motion.div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
        <LoadingIndicatorTwo size={28} />
      </motion.div>
    );
  }

  return (
    <motion.button
      data-testid={`spotify-play-button-${songId}`}
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
          <span className="absolute inset-0 z-0 animate-pulse-shadow rounded-full" />
          <Pause className="relative z-10 h-6 w-6 fill-foreground text-foreground" />
        </motion.span>
      )}
    </motion.button>
  );
};

export default SpotifyPlayIcon;
