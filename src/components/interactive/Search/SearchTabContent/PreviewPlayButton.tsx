import { LoadingIndicatorTwo } from "@/components/Indicators";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
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

  // No preview URL but has spotifyId → open in Spotify
  if (!previewUrl && spotifyId) {
    return (
      <motion.a
        href={`https://open.spotify.com/track/${spotifyId}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 1 }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary"
        title="Open in Spotify"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-foreground">
          <path d="M5.5 16 Q11.5 13.5 18.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 11.5 Q11 8.5 20 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M3 7.5 Q11 3.5 21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.a>
    );
  }

  // No spotifyId and no preview URL → nothing to play or link to
  if (!spotifyId) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full bg-slate-400">
            <Play className="h-6 w-6 text-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent>No preview available</TooltipContent>
      </Tooltip>
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
