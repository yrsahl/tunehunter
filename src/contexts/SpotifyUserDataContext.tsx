import { SpotifyUserData } from "@/types/spotify-types";
import { createContext, ReactNode, useContext } from "react";

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
  return (
    <SpotifyUserDataContext.Provider
      value={{
        spotifyConnected: false,
        spotifyUserData: null,
        isSpotifyUserDataLoading: false,
        refetchSpotifyUserData: () => {},
      }}
    >
      {children}
    </SpotifyUserDataContext.Provider>
  );
};
