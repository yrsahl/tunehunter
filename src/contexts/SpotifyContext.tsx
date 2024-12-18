import { fetchSpotifyUserData } from "@/helpers/spotify/fetch-spotify-data";
import { SpotifyUserData } from "@/types/spotify";
import { api } from "@/utils/api";
import { useSession } from "next-auth/react";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface ISpotifyContext {
  spotifyUserData: SpotifyUserData | null;
  refreshSpotifyUserData: () => void;
  isSpotifyUserDataLoading: boolean;
}

const SpotifyContext = createContext<ISpotifyContext>({
  spotifyUserData: null,
  refreshSpotifyUserData: () => {},
  isSpotifyUserDataLoading: false,
});

export const useSpotifyContext = () => useContext(SpotifyContext);

export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
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
  const accessToken = spotifyAccountData?.data?.access_token;

  const refreshSpotifyUserData = async () => {
    // Reset if we have no valid token
    if (!accessToken) {
      setSpotifyUserData(null);
      return;
    }

    // Otherwise start fetching
    setIsSpotifyUserDataLoading(true);

    try {
      const response = await fetchSpotifyUserData(accessToken);
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
  }, [accessToken]);

  return (
    <SpotifyContext.Provider
      value={{
        spotifyUserData,
        refreshSpotifyUserData,
        isSpotifyUserDataLoading,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};
