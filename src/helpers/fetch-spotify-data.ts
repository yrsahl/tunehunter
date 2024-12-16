import {
  SpotifyArtists,
  SpotifySearchData,
  type SpotifyCurrentlyPlaying,
  type SpotifyProfileData,
  type SpotifyQueue,
  type SpotifyRecentlyPlayed,
  type SpotifyTracks,
} from "@/types/spotify";

const SONG_LIMIT = 30;

// User data (fetched with user token)
const USER_PROFILE_ENDPOINT = "https://api.spotify.com/v1/me";
const CURRENTLY_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const QUEUE_ENDPOINT = "https://api.spotify.com/v1/me/player/queue";
const RECENTLY_PLAYED_ENDPOINT = `https://api.spotify.com/v1/me/player/recently-played?limit=${SONG_LIMIT}`;
const TOP_ARTISTS_ENDPOINT = `https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=${SONG_LIMIT}`;
const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=${SONG_LIMIT}`;

export const fetchSpotifyUserData = async (userToken: string) => {
  const [profileData, currentlyPlaying, queue, recentlyPlayed, topArtists, topTracks] =
    await Promise.all([
      fetchProfileData(userToken),
      fetchCurrentlyPlaying(userToken),
      fetchQueue(userToken),
      fetchRecentlyPlayed(userToken),
      fetchTopArtists(userToken),
      fetchTopTracks(userToken),
    ]);

  return { profileData, currentlyPlaying, queue, recentlyPlayed, topArtists, topTracks };
};

export const fetchProfileData = (token: string) => {
  return fetchSpotifyData<SpotifyProfileData>(token, USER_PROFILE_ENDPOINT);
};

export const fetchCurrentlyPlaying = (token: string) => {
  return fetchSpotifyData<SpotifyCurrentlyPlaying>(token, CURRENTLY_PLAYING_ENDPOINT);
};

export const fetchQueue = (token: string) => {
  return fetchSpotifyData<SpotifyQueue>(token, QUEUE_ENDPOINT);
};

export const fetchRecentlyPlayed = (token: string) => {
  return fetchSpotifyData<SpotifyRecentlyPlayed>(token, RECENTLY_PLAYED_ENDPOINT);
};

export const fetchTopArtists = (token: string) => {
  return fetchSpotifyData<SpotifyArtists>(token, TOP_ARTISTS_ENDPOINT);
};

export const fetchTopTracks = (token: string) => {
  return fetchSpotifyData<SpotifyTracks>(token, TOP_TRACKS_ENDPOINT);
};

// Search data (fetched with app token)
const SEARCH_ENDPOINT = "https://api.spotify.com/v1/search";

export const fetchSpotifySearchData = async (appToken: string, query: string) => {
  // Build searchUrl
  const searchParams = new URLSearchParams({
    q: query,
    type: "track",
    limit: SONG_LIMIT.toString(),
  });
  const searchUrl = `${SEARCH_ENDPOINT}?${searchParams.toString()}`;

  // Fetch
  return fetchSpotifyData<SpotifySearchData>(appToken, searchUrl);
};

// Helper
async function fetchSpotifyData<T>(token: string, endpoint: string): Promise<T | null> {
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 204 || response.status >= 400) {
    return null;
  }
  return (await response.json()) as Promise<T>;
}
