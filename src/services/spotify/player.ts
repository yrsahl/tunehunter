import axios from "axios";

export async function playTrack(deviceId: string, token: string, trackId?: string) {
  if (!deviceId || !token) return;

  // If trackId is supplied, start the song; otherwise resume
  const body: Record<string, any> = {};
  if (trackId) {
    body.uris = [`spotify:track:${trackId}`];
  }

  try {
    await axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return {
      success: "Playback started.",
    };
  } catch (error) {
    return {
      error: "Failed to start playback. Error: " + error,
    };
  }
}

export async function pausePlayback(deviceId: string, token: string) {
  if (!deviceId || !token) return;

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
    return {
      success: "Playback stopped.",
    };
  } catch (error) {
    return {
      error: "Failed to stop playback. Error: " + error,
    };
  }
}
