import { Button } from "@/components/ui/button";
import useFavorites from "@/hooks/useFavorites";
import { motion, useAnimation } from "framer-motion";
import { HeartIcon, HeartOff } from "lucide-react";

interface FavoritesStatusIconProps {
  songId: string;
  variant?: "big" | "small";
}

interface FavoritedSongProps {
  songId: string;
  sizeClasses: string;
  removeFromFavorites: (songId: string) => void;
}

const FavoritedSong = ({ songId, sizeClasses, removeFromFavorites }: FavoritedSongProps) => {
  const heartFullControls = useAnimation();
  const heartBreakControls = useAnimation();

  const handleMouseEnter = () => {
    heartFullControls.start({ opacity: 0 });
    heartBreakControls.start({ opacity: 1 });
  };

  const handleMouseLeave = () => {
    heartBreakControls.start({ opacity: 0 });
    heartFullControls.start({ opacity: 1 });
  };

  return (
    <Button
      data-testid="favorites-remove-button"
      size="icon"
      className="relative border-none bg-transparent transition-all duration-300 hover:bg-transparent"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => removeFromFavorites(songId)}
    >
      <>
        <motion.div
          initial={{ opacity: 1 }}
          animate={heartFullControls}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <HeartIcon className={`${sizeClasses} h-7 w-7 fill-foreground text-foreground`} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={heartBreakControls}
          transition={{ duration: 0.3 }}
          className="absolute"
        >
          <HeartOff className={`${sizeClasses} h-7 w-7 text-foreground`} />
        </motion.div>
      </>
    </Button>
  );
};

interface NotFavoritedSongProps {
  songId: string;
  addToFavorites: (songId: string) => void;
}

const NotFavoritedSong = ({ songId, addToFavorites }: NotFavoritedSongProps) => {
  const heartEmptyControls = useAnimation();
  const heartFullControls = useAnimation();

  const handleMouseEnter = () => {
    heartFullControls.start({ opacity: 1 });
    heartEmptyControls.start({ opacity: 0 });
  };

  const handleMouseLeave = () => {
    heartFullControls.start({ opacity: 0 });
    heartEmptyControls.start({ opacity: 1 });
  };

  return (
    <Button
      data-testid="favorites-button"
      size="icon"
      className="relative border-none bg-transparent transition-all duration-300 hover:bg-transparent"
      onClick={() => addToFavorites(songId)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        initial={{ opacity: 1 }}
        animate={heartEmptyControls}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <HeartIcon className="h-7 w-7 text-foreground" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={heartFullControls}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <HeartIcon className="h-7 w-7 fill-foreground text-foreground" />
      </motion.div>
    </Button>
  );
};

const FavoritesStatusIcon = ({ songId, variant = "big" }: FavoritesStatusIconProps) => {
  const { isOnFavorites, addToFavorites, removeFromFavorites } = useFavorites();

  const sizeClasses = variant === "big" ? "h-8 w-8" : "h-7 w-7";

  const handleAddToFavorites = async (id: string) => {
    await addToFavorites(id);
  };

  if (isOnFavorites(songId)) {
    return (
      <FavoritedSong
        songId={songId}
        sizeClasses={sizeClasses}
        removeFromFavorites={removeFromFavorites}
      />
    );
  }

  return <NotFavoritedSong songId={songId} addToFavorites={handleAddToFavorites} />;
};

export default FavoritesStatusIcon;
