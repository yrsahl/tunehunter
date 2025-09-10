import { fetchSpotifyUserData } from "@/services/spotify";
import { SpotifyUserData } from "@/types/spotify-types";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface ISpotifyUserDataContext {
  spotifyConnected: boolean;
  spotifyUserData: SpotifyUserData | null;
  isSpotifyUserDataLoading: boolean;
  refetchSpotifyUserData: () => void;
}

const SpotifyUserDataContext = createContext<ISpotifyUserDataContext>({
  spotifyConnected: false,
  spotifyUserData: null,
  isSpotifyUserDataLoading: false,
  refetchSpotifyUserData: () => {},
});

export const useSpotifyUserDataContext = () => useContext(SpotifyUserDataContext);

export const SpotifyUserDataProvider = ({ children }: { children: ReactNode }) => {
  const [spotifyUserData, setSpotifyUserData] = useState<SpotifyUserData | null>(null);
  const [isSpotifyUserDataLoading, setIsSpotifyUserDataLoading] = useState(false);
  const { data: userData, status } = useSession();
  const loggedIn = status === "authenticated";

  // Fetch Spotify account from our DB
  const { data: spotifyAccountData } = api.account.getSpotifyAccountById.useQuery(
    { userId: userData?.user.id! },
    {
      enabled: loggedIn,
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes for a refreshed access token
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  );
  const spotifyConnected = loggedIn && !!spotifyAccountData?.data;
  const userAccessToken = spotifyAccountData?.data?.access_token;

  // Fetch data from Spotify
  const refetchSpotifyUserData = async () => {
    // Reset if we have no token
    if (!userAccessToken) {
      setSpotifyUserData(null);
      return;
    }

    // Otherwise start fetching
    setIsSpotifyUserDataLoading(true);

    try {
      const response = await fetchSpotifyUserData(userAccessToken);
      setSpotifyUserData(response);
      setIsSpotifyUserDataLoading(false);
    } catch (error) {
      console.error(error);
      setIsSpotifyUserDataLoading(false);
    }
  };

  // Refresh on any change to the access token (new/renewed -> fetch, stale/logged out -> delete)
  useEffect(() => {
    refetchSpotifyUserData();
  }, [userAccessToken]);

  return (
    <SpotifyUserDataContext.Provider
      value={{
        spotifyConnected,
        spotifyUserData,
        isSpotifyUserDataLoading,
        refetchSpotifyUserData,
      }}
    >
      {children}
    </SpotifyUserDataContext.Provider>
  );
};
