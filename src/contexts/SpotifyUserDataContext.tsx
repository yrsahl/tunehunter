import { fetchSpotifyUserData } from "@/helpers/spotify/fetch-spotify-data";
import { SpotifyUserData } from "@/types/spotify";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface ISpotifyUserDataContext {
  spotifyUserData: SpotifyUserData | null;
  refreshSpotifyUserData: () => void;
  isSpotifyUserDataLoading: boolean;
}

const SpotifyUserDataContext = createContext<ISpotifyUserDataContext>({
  spotifyUserData: null,
  refreshSpotifyUserData: () => {},
  isSpotifyUserDataLoading: false,
});

export const useSpotifyUserDataContext = () => useContext(SpotifyUserDataContext);

export const SpotifyUserDataProvider = ({ children }: { children: ReactNode }) => {
  const [spotifyUserData, setSpotifyUserData] = useState<SpotifyUserData | null>(null);
  const [isSpotifyUserDataLoading, setIsSpotifyUserDataLoading] = useState(false);
  const { data: userData } = useSession();

  const { data: spotifyAccountData } = api.account.getSpotifyAccountById.useQuery(
    { userId: userData?.user.id! },
    {
      refetchOnWindowFocus: false,
      enabled: !!userData,
    },
  );
  const userAccessToken = spotifyAccountData?.data?.access_token;

  const refreshSpotifyUserData = async () => {
    // Reset if we have no valid token
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
    refreshSpotifyUserData();
  }, [userAccessToken]);

  return (
    <SpotifyUserDataContext.Provider
      value={{
        spotifyUserData,
        refreshSpotifyUserData,
        isSpotifyUserDataLoading,
      }}
    >
      {children}
    </SpotifyUserDataContext.Provider>
  );
};
