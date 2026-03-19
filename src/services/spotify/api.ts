import { Track } from "@/types/song-types";
import {
  SpotifyArtist,
  SpotifyArtists,
  SpotifySearchData,
  type SpotifyCurrentlyPlaying,
  type SpotifyProfileData,
  type SpotifyQueue,
  type SpotifyRecentlyPlayed,
  type SpotifyTracks,
} from "@/types/spotify-types";

const SONG_LIMIT = 30;

// User data (user oauth)
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

// Search data (client credentials)
const SEARCH_ENDPOINT = "https://api.spotify.com/v1/search";
const DURATION_WINDOW_MS = 3000;

export const fetchSpotifyTrack = async (
  accessToken: string,
  query: string,
  duration: number,
): Promise<Track | null> => {
  const searchParams = new URLSearchParams({
    q: query,
    type: "track",
    limit: SONG_LIMIT.toString(),
  });
  const searchUrl = `${SEARCH_ENDPOINT}?${searchParams.toString()}`;

  const data = await fetchSpotifyData<SpotifySearchData>(accessToken, searchUrl);
  if (!data?.tracks?.items) return null;

  const candidates = data.tracks.items.filter(
    (t) => Math.abs(t.duration_ms - duration) <= DURATION_WINDOW_MS,
  );

  if (candidates.length === 0) return null;

  const closest = candidates.reduce((best, t) =>
    Math.abs(t.duration_ms - duration) < Math.abs(best.duration_ms - duration) ? t : best,
  );

  return {
    song: {
      id: closest.id,
      title: closest.name,
      duration: closest.duration_ms,
      album: closest.album.name ?? null,
      albumArtUrl: closest.album.images[0]?.url ?? "",
      year: closest.album.release_date,
      spotifyId: closest.id,
      isrc: closest.external_ids?.isrc,
    },
    artists: closest.artists.map((a) => ({
      id: a.id,
      name: a.name,
      popularity: null,
      followers: null,
    })),
  };
};

const ARTIST_ENDPOINT = "https://api.spotify.com/v1/artists";

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

export const fetchSpotifyArtistData = async (appToken: string, artistId: string) => {
  const artistUrl = `${ARTIST_ENDPOINT}/${artistId}`;
  // Fetch
  return fetchSpotifyData<SpotifyArtist>(appToken, artistUrl);
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
  return (await response.json()) as T;
}
