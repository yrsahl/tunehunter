import { SpotifyPlaybackState, SpotifyPlaybackStateShort } from "@/types/spotify-playback";
import axios from "axios";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { useEventEmitter } from "../hooks/useEventEmitter";
import useSpotifyTokens from "../hooks/useSpotifyTokens";

interface SpotifyPlayerContextType {
  deviceId: string | null;
  isReady: boolean;
  startPlayback: (trackId: string) => Promise<{ success?: string; error?: string }>;
  pausePlayback: () => Promise<{ success?: string; error?: string }>;
  resumePlayback: () => Promise<{ success?: string; error?: string }>;
  getPlaybackState: () => Promise<{ isPlaying: boolean; progress: number } | null>;
}

export function useSpotifyPlayerContext() {
  const ctx = useContext(SpotifyPlayerContext);
  if (!ctx) throw new Error("useSpotifyPlayerContext must be used within a SpotifyPlayerProvider");
  return ctx;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | undefined>(undefined);

export const SpotifyPlayerProvider = ({ children }: { children: ReactNode }) => {
  const { userAccessToken: token } = useSpotifyTokens();
  const playerRef = useRef<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { publishEvent } = useEventEmitter<{ data: SpotifyPlaybackStateShort }>(
    "spotify-player-state-changed",
  );

  useEffect(() => {
    if (!token) return;
    if (playerRef.current) return;
    let cleanupListeners: (() => void) | null = null;
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      if (!window.Spotify) {
        console.error("Spotify SDK failed to load.");
        return;
      }
      const newPlayer = new window.Spotify.Player({
        name: "TuneHunter Web Player",
        getOAuthToken: (cb: (token: string) => void) => cb(token),
        volume: 0.5,
      });
      playerRef.current = newPlayer;
      const onReady = ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
        setIsReady(true);
      };
      const onNotReady = ({ device_id }: { device_id: string }) => {
        setDeviceId(null);
        setIsReady(false);
      };
      const onPlayerStateChanged = (state: Spotify.PlaybackState | null) => {
        if (!state) return;
        publishEvent({
          data: {
            isPlaying: !state.paused,
            isLoading: state.loading,
            position: state.position,
            duration: state.duration,
          },
        });
      };
      newPlayer.addListener("ready", onReady);
      newPlayer.addListener("not_ready", onNotReady);
      newPlayer.addListener("player_state_changed", onPlayerStateChanged);
      newPlayer.addListener("initialization_error", ({ message }: { message: string }) =>
        console.error(message),
      );
      newPlayer.addListener("authentication_error", ({ message }: { message: string }) =>
        console.error(message),
      );
      newPlayer.addListener("account_error", ({ message }: { message: string }) =>
        console.error(message),
      );
      newPlayer.addListener("playback_error", ({ message }: { message: string }) =>
        console.error(message),
      );
      newPlayer.connect().then((success: boolean) => {
        if (!success) {
          console.error("Failed to connect to Spotify Player");
        }
      });
      cleanupListeners = () => {
        newPlayer.removeListener("ready", onReady);
        newPlayer.removeListener("not_ready", onNotReady);
        newPlayer.removeListener("player_state_changed", onPlayerStateChanged);
        newPlayer.removeListener("initialization_error", ({ message }: { message: string }) =>
          console.error(message),
        );
        newPlayer.removeListener("authentication_error", ({ message }: { message: string }) =>
          console.error(message),
        );
        newPlayer.removeListener("account_error", ({ message }: { message: string }) =>
          console.error(message),
        );
        newPlayer.removeListener("playback_error", ({ message }: { message: string }) =>
          console.error(message),
        );
      };
    };
    if (!document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]')) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      if ((window as any).onSpotifyWebPlaybackSDKReady) {
        (window as any).onSpotifyWebPlaybackSDKReady();
      }
    }
    return () => {
      playerRef.current?.disconnect();
      playerRef.current = null;
      setDeviceId(null);
      setIsReady(false);
      if (cleanupListeners) cleanupListeners();
      delete (window as any).onSpotifyWebPlaybackSDKReady;
    };
  }, [token]);

  async function startPlayback(trackId: string) {
    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          uris: [`spotify:track:${trackId}`],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return { success: "Playback started." };
    } catch (error) {
      return { error: "Failed to start playback. Error: " + error };
    }
  }
  async function resumePlayback() {
    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return { success: "Playback resumed." };
    } catch (error) {
      return { error: "Failed to resume playback. Error: " + error };
    }
  }
  async function pausePlayback() {
    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          validateStatus: () => true,
        },
      );
      return { success: "Playback paused." };
    } catch (error) {
      return { error: "Failed to pause playback. Error: " + error };
    }
  }
  async function getPlaybackState() {
    try {
      const response = await axios.get<SpotifyPlaybackState>(
        `https://api.spotify.com/v1/me/player`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return {
        isPlaying: response.data.is_playing,
        progress: response.data.progress_ms,
      };
    } catch (error) {
      console.error("Failed to get current playback:", error);
      return null;
    }
  }

  return (
    <SpotifyPlayerContext.Provider
      value={{ deviceId, isReady, startPlayback, pausePlayback, resumePlayback, getPlaybackState }}
    >
      {children}
    </SpotifyPlayerContext.Provider>
  );
};
