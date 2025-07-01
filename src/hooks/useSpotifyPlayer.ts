import { useEffect, useState } from "react";

type UseSpotifyPlayerResult = {
  player: Spotify.Player | null;
  deviceId: string | null;
};

export default function useSpotifyPlayer(token?: string | null): UseSpotifyPlayerResult {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

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

  return { player, deviceId };
}
