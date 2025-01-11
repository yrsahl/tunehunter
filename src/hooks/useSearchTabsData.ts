import { SearchTab } from "@/components/interactive/Search/SearchTabBar";
import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import {
  SpotifyCurrentlyPlaying,
  SpotifyQueue,
  SpotifyRecentlyPlayed,
  SpotifyTracks,
} from "@/types/spotify";
import { api } from "@/utils/api";

export type SpotifyTabData = {
  currentlyPlaying: SpotifyCurrentlyPlaying | null;
  queue: SpotifyQueue | null;
  recentlyPlayed: SpotifyRecentlyPlayed | null;
  mostPlayed: SpotifyTracks | null;
};

// Use all data when SearchTabContent is rendered, not on a Tab level
const useSearchTabsData = (userId?: string) => {
  const { data: trendingData, isLoading: isTrendingDataLoading } = api.song.getTrending.useQuery();
  const { data: historyData, isLoading: isHistoryDataLoading } = api.song.getHistory.useQuery();
  const { data: wishlistData, isLoading: isWishlistDataLoading } = api.song.getWishlist.useQuery();
  const { spotifyUserData, refreshSpotifyUserData, isSpotifyUserDataLoading } =
    useSpotifyUserDataContext();
  const utils = api.useUtils();

  const isDataLoading =
    isHistoryDataLoading ||
    isWishlistDataLoading ||
    isTrendingDataLoading ||
    isSpotifyUserDataLoading;

  const spotifyData: SpotifyTabData = {
    currentlyPlaying: spotifyUserData?.currentlyPlaying || null,
    queue: spotifyUserData?.queue || null,
    mostPlayed: spotifyUserData?.topTracks || null,
    recentlyPlayed: spotifyUserData?.recentlyPlayed || null,
  };

  const data = {
    trendingData,
    historyData,
    wishlistData,
    spotifyData,
  };

  const refetchData = (tabToBeRefetched?: SearchTab) => {
    // Single tab
    if (tabToBeRefetched === "spotify") refreshSpotifyUserData();
    if (tabToBeRefetched === "history") utils.song.getHistory.invalidate();
    if (tabToBeRefetched === "wishlist") utils.song.getWishlist.invalidate();
    if (tabToBeRefetched === "trending") utils.song.getTrending.invalidate();

    // All tabs
    utils.song.invalidate();
    refreshSpotifyUserData();
  };

  return {
    data,
    isDataLoading,
    refetchData,
  };
};

export default useSearchTabsData;
