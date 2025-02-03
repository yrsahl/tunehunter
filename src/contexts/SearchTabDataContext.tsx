import { SearchTab } from "@/components/interactive/Search/SearchTabBar";
import useSpotifySongData, { SpotifyTabData } from "@/hooks/useSpotifySongData";
import { AppRouter } from "@/server/api/root";
import { api } from "@/utils/api";
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
  wishlist: {
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
  wishlist: {
    data: null,
    isLoading: false,
    refetchData: () => {},
  },
});

export const useSearchTabData = () => useContext(SearchTabDataContext);

export const SearchTabDataProvider = ({ children }: { children: ReactNode }) => {
  const { status } = useSession();
  const loggedIn = status === "authenticated";
  const utils = api.useUtils();
  const { spotifyConnected } = useSpotifyUserDataContext();

  // Fetch data
  const { data: trendingData, isLoading: isTrendingDataLoading } =
    api.song.getTrendingSongs.useQuery();
  const { data: historyData, isLoading: isHistoryDataLoading } =
    api.userActivities.getHistory.useQuery(undefined, { enabled: loggedIn });
  const { data: wishlistData, isLoading: isWishlistDataLoading } =
    api.userActivities.getUserActivity.useQuery({ type: "wishlist" }, { enabled: loggedIn });
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
  const refetchWishlistData = () => {
    utils.userActivities.getUserActivity.invalidate();
  };

  // Check for a given tab to use in the SearchTabContent component to share loading and error message styles
  const isTabDataLoading = (tab?: SearchTab) => {
    switch (tab) {
      case "trending":
        return isTrendingDataLoading;
      case "spotify":
        return isSpotifyDataLoading;
      case "history":
        return isHistoryDataLoading;
      case "wishlist":
        return isWishlistDataLoading;
      default:
        return false;
    }
  };
  const isTabDataReady = (tab?: SearchTab) => {
    switch (tab) {
      case "trending":
        return !isTrendingDataLoading && !!trendingData;
      case "spotify":
        return !isSpotifyDataLoading && !!spotifyData;
      case "history":
        return !isHistoryDataLoading && !!historyData;
      case "wishlist":
        return !isWishlistDataLoading && !!wishlistData && wishlistData.length > 0;
      default:
        return false;
    }
  };

  // On login or spotify connect, get all the data
  useEffect(() => {
    if (!loggedIn) return;

    refetchHistoryData();
    refetchWishlistData();

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
    wishlist: {
      data: wishlistData,
      isLoading: isWishlistDataLoading,
      refetchData: refetchWishlistData,
    },
  };

  return (
    <SearchTabDataContext.Provider value={returnObject}>{children}</SearchTabDataContext.Provider>
  );
};
