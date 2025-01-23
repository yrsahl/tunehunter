import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import {
  SpotifyCurrentlyPlaying,
  SpotifyQueue,
  SpotifyRecentlyPlayed,
  SpotifyTracks,
} from "@/types/spotify";

export type SpotifyTabData = {
  currentlyPlaying: SpotifyCurrentlyPlaying | null;
  queue: SpotifyQueue | null;
  recentlyPlayed: SpotifyRecentlyPlayed | null;
  mostPlayed: SpotifyTracks | null;
};

const useSpotifySongData = () => {
  const { spotifyUserData, refetchSpotifyUserData, isSpotifyUserDataLoading } =
    useSpotifyUserDataContext();

  const spotifyData: SpotifyTabData = {
    currentlyPlaying: spotifyUserData?.currentlyPlaying || null,
    queue: spotifyUserData?.queue || null,
    mostPlayed: spotifyUserData?.topTracks || null,
    recentlyPlayed: spotifyUserData?.recentlyPlayed || null,
  };

  return {
    data: spotifyData,
    isLoading: isSpotifyUserDataLoading,
    refetchData: refetchSpotifyUserData,
  };
};

export default useSpotifySongData;
