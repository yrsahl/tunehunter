import { LoadingIndicatorTwo } from "@/components/Indicators";
import { motion } from "framer-motion";
import { ExternalLink, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PreviewPlayButtonProps {
  spotifyId: string | null | undefined;
  previewUrl: string | null | undefined;
  isLoadingPreview?: boolean;
}

const PreviewPlayButton = ({ spotifyId, previewUrl, isLoadingPreview }: PreviewPlayButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop and clean up audio when preview URL changes or component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [previewUrl]);

  const handleClick = () => {
    if (!previewUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(previewUrl);
      audioRef.current.addEventListener("ended", () => setIsPlaying(false));
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  if (isLoadingPreview) {
    return (
      <motion.div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
        <LoadingIndicatorTwo size={28} />
      </motion.div>
    );
  }

  // No preview URL but has spotifyId → "Open in Spotify" link
  if (!previewUrl && spotifyId) {
    return (
      <motion.a
        href={`https://open.spotify.com/track/${spotifyId}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 1 }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary"
      >
        <ExternalLink className="h-5 w-5 text-foreground" />
      </motion.a>
    );
  }

  // No spotifyId → disabled button
  if (!spotifyId) {
    return (
      <div className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full bg-slate-400">
        <Play className="h-6 w-6 text-foreground" />
      </div>
    );
  }

  // Has preview URL → play/pause button
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 1 }}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary"
      onClick={handleClick}
    >
      {isPlaying ? (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative flex"
        >
          <span className="absolute inset-0 z-0 animate-pulse-shadow rounded-full" />
          <Pause className="relative z-10 h-6 w-6 fill-foreground text-foreground" />
        </motion.span>
      ) : (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          <Play className="h-6 w-6 fill-foreground text-foreground" />
        </motion.span>
      )}
    </motion.button>
  );
};

export default PreviewPlayButton;
