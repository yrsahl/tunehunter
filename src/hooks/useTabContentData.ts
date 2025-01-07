import { SearchTab } from "@/components/interactive/Search/SearchTabBar";
import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import { songCountView, wishlists } from "@/server/db/schema";
import {
  SpotifyCurrentlyPlaying,
  SpotifyQueue,
  SpotifyRecentlyPlayed,
  SpotifyTracks,
  SpotifyUserData,
} from "@/types/spotify";
import { api } from "@/utils/api";
import { InferSelectModel } from "drizzle-orm";

export type SpotifySearchTabData = {
  currentlyPlaying: SpotifyCurrentlyPlaying | null;
  queue: SpotifyQueue | null;
  recentlyPlayed: SpotifyRecentlyPlayed | null;
  topTracks: SpotifyTracks | null;
};

type SearchTabsContentData = {
  trendingData?: (typeof songCountView.$inferSelect)[];
  // historyData?: InferSelectModel<typeof >;
  wishlistData?: InferSelectModel<typeof wishlists>[];
  spotifyData?: SpotifyUserData;
};

const useSearchTabsContentData = (userId?: string) => {
  const { data: trendingData, isLoading: isTrendingDataLoading } = api.song.getTrending.useQuery();
  const { data: historyData, isLoading: isHistoryDataLoading } = api.song.getHistory.useQuery();
  const { data: wishlistData, isLoading: isWishlistDataLoading } = api.song.getWishlist.useQuery();
  const { spotifyUserData, refreshSpotifyUserData, isSpotifyUserDataLoading } =
    useSpotifyUserDataContext();
  const utils = api.useUtils();

  const spotifyData = {
    currentlyPlaying: spotifyUserData?.currentlyPlaying ?? null,
    queue: spotifyUserData?.queue ?? [],
    mostPlayed: spotifyUserData?.topTracks ?? [],
    recentlyPlayed: spotifyUserData?.recentlyPlayed ?? [],
  };
  const data: SearchTabsContentData = {
    trendingData,
    // historyData,
    wishlistData,
    // spotifyData
  };

  const isLoading =
    isHistoryDataLoading ||
    isWishlistDataLoading ||
    isTrendingDataLoading ||
    isSpotifyUserDataLoading;

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
    isLoading,
    refreshData: refetchData,
  };
};

export default useSearchTabsContentData;
