import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useState } from "react";

interface SpotifyPlayIconProps {}

const SpotifyPlayIcon = ({}: SpotifyPlayIconProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 1 }}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-primary"
      onClick={() => setIsPlaying(!isPlaying)}
    >
      {isPlaying ? (
        <Pause className="h-6 w-6 fill-foreground text-foreground" />
      ) : (
        <Play className="h-6 w-6 fill-foreground text-foreground" />
      )}
    </motion.div>
  );
};

export default SpotifyPlayIcon;
