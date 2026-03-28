import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import useFavorites from "@/hooks/useFavorites";
import { SpotifyTrack } from "@/types/song-types";
import { motion, useAnimation } from "framer-motion";
import { HeartIcon, HeartOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface PlaylistFavoritesIconProps {
  track: SpotifyTrack;
}

const PlaylistFavoritesIcon = ({ track }: PlaylistFavoritesIconProps) => {
  const { status } = useSession();
  const router = useRouterWithHelpers();
  const { isOnFavoritesBySpotifyId, addToFavoritesFromSpotifyTrack, removeFromFavoritesBySpotifyId } =
    useFavorites();

  const spotifyId = track.song.spotifyId ?? "";
  const isFavorited = isOnFavoritesBySpotifyId(spotifyId);

  const heartFullControls = useAnimation();
  const heartBreakControls = useAnimation();
  const heartEmptyControls = useAnimation();
  const heartFillHoverControls = useAnimation();

  if (status !== "authenticated") {
    return (
      <Button
        size="icon"
        className="border-none bg-transparent transition-all duration-300 hover:bg-transparent"
        onClick={() => {
          toast("Sign in to save songs to your favorites", {
            action: { label: "Sign in", onClick: () => router.setParams({ profile: "login" }) },
          });
        }}
      >
        <HeartIcon className="h-7 w-7 text-foreground/40" />
      </Button>
    );
  }

  if (isFavorited) {
    return (
      <Button
        size="icon"
        className="border-none bg-transparent transition-all duration-300 hover:bg-transparent"
        onMouseEnter={() => { heartFullControls.start({ opacity: 0 }); heartBreakControls.start({ opacity: 1 }); }}
        onMouseLeave={() => { heartBreakControls.start({ opacity: 0 }); heartFullControls.start({ opacity: 1 }); }}
        onClick={() => void removeFromFavoritesBySpotifyId(spotifyId)}
      >
        <motion.div initial={{ opacity: 1 }} animate={heartFullControls} transition={{ duration: 0.3 }} className="absolute">
          <HeartIcon className="h-7 w-7 fill-foreground text-foreground" />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={heartBreakControls} transition={{ duration: 0.3 }} className="absolute">
          <HeartOff className="h-7 w-7 text-foreground" />
        </motion.div>
      </Button>
    );
  }

  return (
    <Button
      size="icon"
      className="border-none bg-transparent transition-all duration-300 hover:bg-transparent"
      onMouseEnter={() => { heartFillHoverControls.start({ opacity: 1 }); heartEmptyControls.start({ opacity: 0 }); }}
      onMouseLeave={() => { heartFillHoverControls.start({ opacity: 0 }); heartEmptyControls.start({ opacity: 1 }); }}
      onClick={() => void addToFavoritesFromSpotifyTrack(track)}
    >
      <motion.div initial={{ opacity: 1 }} animate={heartEmptyControls} transition={{ duration: 0.3 }} className="absolute">
        <HeartIcon className="h-7 w-7 text-foreground" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={heartFillHoverControls} transition={{ duration: 0.3 }} className="absolute">
        <HeartIcon className="h-7 w-7 fill-foreground text-foreground" />
      </motion.div>
    </Button>
  );
};

export default PlaylistFavoritesIcon;
