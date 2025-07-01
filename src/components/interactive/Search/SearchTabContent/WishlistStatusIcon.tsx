import { Button } from "@/components/ui/button";
import useWishlist from "@/hooks/useWishlist";
import { motion, useAnimation } from "framer-motion";
import { HeartIcon, HeartOff } from "lucide-react";

interface WishlistStatusIconProps {
  songId: string;
}

const WishlistStatusIcon = ({ songId }: WishlistStatusIconProps) => {
  const { isOnWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const WishlistedSong = () => {
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
        size="icon"
        className="w-8 border-none bg-transparent transition-all duration-300 hover:bg-transparent"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => removeFromWishlist(songId)}
      >
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={heartBreakControls}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <HeartOff className="h-7 w-7 text-foreground" />
          </motion.div>
          <motion.div
            initial={{ opacity: 1 }}
            animate={heartFullControls}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <HeartIcon className="h-7 w-7 fill-foreground text-foreground" />
          </motion.div>
        </>
      </Button>
    );
  };

  const NotWishlistedSong = () => {
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
        size="icon"
        className="w-8 border-none bg-transparent transition-all duration-300 hover:bg-transparent"
        onClick={() => addToWishlist(songId)}
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

  if (isOnWishlist(songId)) {
    return <WishlistedSong />;
  }

  return <NotWishlistedSong />;
};

export default WishlistStatusIcon;
