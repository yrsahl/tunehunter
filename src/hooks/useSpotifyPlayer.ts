import { SpotifyPlaybackState, SpotifyPlaybackStateShort } from "@/types/spotify-playback-types";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useEventEmitter } from "./useEventEmitter";

// There are two ways to control the Spotify Web Player:
// 1. Via the SDK (https://developer.spotify.com/documentation/web-playback-sdk/reference#spotifyplayer) - the 'player' object
// 2. Manually via the Web API (e.g. https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback), necessary for missing implementations in the SDK like playing a specific track
export default function useSpotifyPlayer() {
  const token: string | undefined = undefined; // Spotify OAuth removed
  const playerRef = useRef<Spotify.Player | null>(null);
  const [_player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const { publishEvent } = useEventEmitter<{ data: SpotifyPlaybackStateShort }>(
    "spotify-player-state-changed",
  );

  // Create player
  useEffect(() => {
    if (!token) return;
    if (playerRef.current) return; // Prevent multiple player instances

    let cleanupListeners: (() => void) | null = null;

    // Define the global callback
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

      // Listener functions
      const onReady = ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id);
      };
      const onNotReady = ({ device_id }: { device_id: string }) => {
        console.warn("Spotify Player not ready:", device_id);
        setDeviceId(null);
      };
      const onInitError = ({ message }: { message: string }) => console.error(message);
      const onAuthError = ({ message }: { message: string }) => console.error(message);
      const onAccountError = ({ message }: { message: string }) => console.error(message);
      const onPlaybackError = ({ message }: { message: string }) => console.error(message);
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

      // Add listener functions
      newPlayer.addListener("ready", onReady);
      newPlayer.addListener("not_ready", onNotReady);
      newPlayer.addListener("initialization_error", onInitError);
      newPlayer.addListener("authentication_error", onAuthError);
      newPlayer.addListener("account_error", onAccountError);
      newPlayer.addListener("playback_error", onPlaybackError);
      newPlayer.addListener("player_state_changed", onPlayerStateChanged);

      newPlayer.connect().then((success: boolean) => {
        if (success) {
          setPlayer(newPlayer);
        } else {
          console.error("Failed to connect to Spotify Player");
        }
      });

      // Cleanup listener function
      cleanupListeners = () => {
        newPlayer.removeListener("ready", onReady);
        newPlayer.removeListener("not_ready", onNotReady);
        newPlayer.removeListener("initialization_error", onInitError);
        newPlayer.removeListener("authentication_error", onAuthError);
        newPlayer.removeListener("account_error", onAccountError);
        newPlayer.removeListener("playback_error", onPlaybackError);
        newPlayer.removeListener("player_state_changed", onPlayerStateChanged);
      };
    };

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    // Cleanup
    return () => {
      script.remove();
      playerRef.current?.disconnect();
      playerRef.current = null;
      setPlayer(null);
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
      // publishEvent({ data: "playback-started" });
      return {
        success: "Playback started.",
      };
    } catch (error) {
      return {
        error: "Failed to start playback. Error: " + error,
      };
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
      // publishEvent({ data: "playback-resumed" });
      return {
        success: "Playback resumed.",
      };
    } catch (error) {
      return {
        error: "Failed to resume playback. Error: " + error,
      };
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
      // publishEvent({ data: "playback-paused" });
      return {
        success: "Playback paused.",
      };
    } catch (error) {
      return {
        error: "Failed to pause playback. Error: " + error,
      };
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

  return { startPlayback, pausePlayback, resumePlayback, getPlaybackState };
}
