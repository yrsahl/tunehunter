import { SearchTab } from "@/components/interactive/Search/SearchTabs/SearchTabBar";
import { useEventEmitter } from "@/hooks/useEventEmitter";
import useSpotifySongData, { SpotifyTabData } from "@/hooks/useSpotifySongData";
import { api } from "@/lib/api";
import { AppRouter } from "@/server/api/root";
import { SpotifyPlaybackStateShort } from "@/types/spotify-playback-types";
import { inferProcedureOutput } from "@trpc/server";
import { useSession } from "next-auth/react";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { useSpotifyUserDataContext } from "./SpotifyUserDataContext";

// Load all the SearchTab data in once place and distribute it later

interface ISearchTabDataContext {
  isTabDataLoading: (tab: SearchTab) => boolean;
  isTabDataReady: (tab: SearchTab) => boolean;
  trending: {
    data?: inferProcedureOutput<AppRouter["song"]["getTrendingSongs"]> | null;
    isLoading: boolean;
    refetchData: () => void;
  };
  spotify: {
    data: SpotifyTabData | null;
    isLoading: boolean;
    refetchData: () => void;
  };
  history: {
    data?: inferProcedureOutput<AppRouter["userActivities"]["getHistory"]> | null;
    isLoading: boolean;
    refetchData: () => void;
  };
  favorites: {
    data?: inferProcedureOutput<AppRouter["userActivities"]["getUserActivity"]> | null;
    isLoading: boolean;
    refetchData: () => void;
  };
}

const SearchTabDataContext = createContext<ISearchTabDataContext>({
  isTabDataLoading: () => false,
  isTabDataReady: () => false,
  trending: {
    data: null,
    isLoading: false,
    refetchData: () => {},
  },
  spotify: {
    data: null,
    isLoading: false,
    refetchData: () => {},
  },
  history: {
    data: null,
    isLoading: false,
    refetchData: () => {},
  },
  favorites: {
    data: null,
    isLoading: false,
    refetchData: () => {},
  },
});

export const useSearchTabDataContext = () => useContext(SearchTabDataContext);

export const SearchTabDataProvider = ({ children }: { children: ReactNode }) => {
  const { status } = useSession();
  const loggedIn = status === "authenticated";
  const utils = api.useUtils();
  const { spotifyConnected } = useSpotifyUserDataContext();
  const { eventData } = useEventEmitter<{ data: SpotifyPlaybackStateShort }>(
    "spotify-player-state-changed",
  );

  // Fetch data
  const { data: trendingData, isLoading: isTrendingDataLoading } =
    api.song.getTrendingSongs.useQuery(undefined, { staleTime: 5 * 60 * 1000 });
  const { data: historyData, isLoading: isHistoryDataLoading } =
    api.userActivities.getHistory.useQuery(undefined, { enabled: loggedIn });
  const { data: favoritesData, isLoading: isFavoritesDataLoading } =
    api.userActivities.getUserActivity.useQuery({ type: "favorite" }, { enabled: loggedIn });
  const {
    data: spotifyData,
    isLoading: isSpotifyDataLoading,
    refetchData: refreshSpotifyData,
  } = useSpotifySongData();

  // Refresh data
  const refetchTrendingData = () => {
    utils.song.getTrendingSongs.invalidate();
  };
  const refetchHistoryData = () => {
    utils.userActivities.getHistory.invalidate();
  };
  const refetchFavoritesData = () => {
    utils.userActivities.getUserActivity.invalidate();
  };

  // Check for a given tab to use in the SearchTabContent component to share loading and error message styles
  const isTabDataLoading = (tab?: SearchTab) => {
    switch (tab) {
      case "trending":
        return isTrendingDataLoading;
      case "history":
        return isHistoryDataLoading;
      case "favorites":
        return isFavoritesDataLoading;
      default:
        return false;
    }
  };
  const isTabDataReady = (tab?: SearchTab) => {
    switch (tab) {
      case "trending":
        return !isTrendingDataLoading && !!trendingData;
      case "history":
        return !isHistoryDataLoading && !!historyData;
      case "favorites":
        return !isFavoritesDataLoading && !!favoritesData && favoritesData.length > 0;
      default:
        return false;
    }
  };

  // On spotify player state change, refresh spotify data
  useEffect(() => {
    if (!eventData || !spotifyConnected) return;
    const { data } = eventData;

    // Refresh spotify data on new track
    if (data.position === 0) refreshSpotifyData();
  }, [eventData]);

  // On login or spotify connect, get all the data
  useEffect(() => {
    if (!loggedIn) return;

    refetchHistoryData();
    refetchFavoritesData();

    if (!spotifyConnected) return;

    refreshSpotifyData();
  }, [loggedIn, spotifyConnected]);

  const returnObject = {
    isTabDataLoading,
    isTabDataReady,
    trending: {
      data: trendingData,
      isLoading: isTrendingDataLoading,
      refetchData: refetchTrendingData,
    },
    spotify: {
      data: spotifyData,
      isLoading: isSpotifyDataLoading,
      refetchData: refreshSpotifyData,
    },
    history: {
      data: historyData,
      isLoading: isHistoryDataLoading,
      refetchData: refetchHistoryData,
    },
    favorites: {
      data: favoritesData,
      isLoading: isFavoritesDataLoading,
      refetchData: refetchFavoritesData,
    },
  };

  return (
    <SearchTabDataContext.Provider value={returnObject}>{children}</SearchTabDataContext.Provider>
  );
};
