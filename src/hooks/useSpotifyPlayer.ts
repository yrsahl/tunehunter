import axios from "axios";
import { useEffect, useState } from "react";
import { useEventEmitter } from "./useEventEmitter";
import useSpotifyTokens from "./useSpotifyTokens";

export default function useSpotifyPlayer() {
  const { userAccessToken: token } = useSpotifyTokens();
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const { publishEvent } = useEventEmitter("spotify-player-state-changed");

  useEffect(() => {
    if (!token) return;

    // Define the global callback BEFORE loading the script
    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      if (!window.Spotify) {
        console.error("Spotify SDK failed to load.");
        return;
      }

      const newPlayer = new window.Spotify.Player({
        name: "TuneHunter Spotify Web Player",
        getOAuthToken: (cb: (token: string) => void) => cb(token),
        volume: 0.5,
      });

      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
      });

      newPlayer.addListener("initialization_error", ({ message }) => console.error(message));
      newPlayer.addListener("authentication_error", ({ message }) => console.error(message));
      newPlayer.addListener("account_error", ({ message }) => console.error(message));
      newPlayer.addListener("playback_error", ({ message }) => console.error(message));

      newPlayer.connect().then((success: boolean) => {
        if (success) {
          setPlayer(newPlayer);
        } else {
          console.error("Failed to connect to Spotify Player");
        }
      });
    };

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      player?.disconnect();
      // Clean up the global callback
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
      publishEvent({ data: "playback-started" });
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
      publishEvent({ data: "playback-resumed" });
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
      publishEvent({ data: "playback-paused" });
      return {
        success: "Playback paused.",
      };
    } catch (error) {
      return {
        error: "Failed to pause playback. Error: " + error,
      };
    }
  }

  return { startPlayback, pausePlayback, resumePlayback };
}
