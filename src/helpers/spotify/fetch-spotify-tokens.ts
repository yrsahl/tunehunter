import { env } from "@/env";
import { SpotifyClientCredentialsTokenData, SpotifyRefreshTokenData } from "@/types/spotify";

const TOKEN_URL = "https://accounts.spotify.com/api/token";

/**
 * Fetches a new Spotify access token using the client credentials flow (for non-user related endpoints and data).
 * Any user-related credentials are handled by NextAuth's SignIn() method.
 *
 * @returns {Promise<{ access_token: string; expires_at: number } | { error: string }>} - A promise that resolves to an object containing the new access token and its expiration time, or an error object.
 */
export const requestClientCredentialsToken = async () => {
  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "client_credentials",
      }),
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: "no-cache",
    });
    const data: SpotifyClientCredentialsTokenData = await response.json();

    return {
      access_token: data.access_token,
      expires_at: Math.round((Date.now() + data.expires_in * 1000) / 1000),
    };
  } catch (error) {
    return {
      error: "ClientCredentialsTokenError",
    };
  }
};

/**
 * Refreshes the Spotify access token (either Auth code or Client credentials) using the provided refresh token.
 *
 * @param {string} oldRefreshToken - The refresh token to use for obtaining a new access token.
 * @returns {Promise<{ access_token: string; expires_at: number } | { error: string }>} - A promise that resolves to an object containing the new access token and its expiration time, or an error object.
 */
export const requestNewAccessToken = async (oldRefreshToken: string) => {
  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: oldRefreshToken,
      }),
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: "no-cache",
    });
    const data: SpotifyRefreshTokenData = await response.json();

    return {
      access_token: data.access_token,
      expires_at: Math.round((Date.now() + data.expires_in * 1000) / 1000),
    };
  } catch (error) {
    return {
      error: "RefreshAccessTokenError",
    };
  }
};
