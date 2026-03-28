import { Track } from "@/types/song-types";
import {
  SpotifyArtist,
  SpotifyArtists,
  SpotifySearchData,
  SpotifyTrack as SpotifyApiTrack,
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
      genre: null,
      spotifyId: closest.id,
      previewUrl: closest.preview_url ?? null,
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

const TRACK_ENDPOINT = "https://api.spotify.com/v1/tracks";

export const fetchSpotifyTrackById = async (
  accessToken: string,
  trackId: string,
): Promise<string | null> => {
  const data = await fetchSpotifyData<SpotifyApiTrack>(accessToken, `${TRACK_ENDPOINT}/${trackId}`);
  return data?.preview_url ?? null;
};

const ARTIST_ENDPOINT = "https://api.spotify.com/v1/artists";

export const fetchSpotifySearchData = async (token: string, query: string) => {
  // Build searchUrl
  const searchParams = new URLSearchParams({
    q: query,
    type: "track",
    limit: SONG_LIMIT.toString(),
  });
  const searchUrl = `${SEARCH_ENDPOINT}?${searchParams.toString()}`;

  // Fetch
  return fetchSpotifyData<SpotifySearchData>(token, searchUrl);
};

export const fetchSpotifyArtistData = async (token: string, artistId: string) => {
  const artistUrl = `${ARTIST_ENDPOINT}/${artistId}`;
  // Fetch
  return fetchSpotifyData<SpotifyArtist>(token, artistUrl);
};

type SpotifyPlaylistTracksPage = {
  items: { track: { id: string; name: string; duration_ms: number; album: { name: string; release_date: string; images: { url: string }[] }; artists: { id: string; name: string }[] } | null }[];
  next: string | null;
};

export const fetchAllPlaylistTracks = async (
  token: string,
  playlistId: string,
): Promise<import("@/types/song-types").SpotifyTrack[] | "not_found" | null> => {
  const MAX_TRACKS = 500;
  const tracks: import("@/types/song-types").SpotifyTrack[] = [];
  let url: string | null =
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,duration_ms,album(name,release_date,images),artists(id,name))),next`;

  const firstPage = await fetchSpotifyPlaylistFirstPage(token, url);
  if (firstPage === "not_found") return "not_found";
  if (!firstPage) return null;

  const addTracks = (page: SpotifyPlaylistTracksPage) => {
    for (const item of page.items) {
      if (!item.track || tracks.length >= MAX_TRACKS) continue;
      tracks.push({
        song: {
          title: item.track.name,
          duration: item.track.duration_ms,
          album: item.track.album.name,
          albumArtUrl: item.track.album.images[0]?.url ?? null,
          year: item.track.album.release_date,
          genre: null,
          spotifyId: item.track.id,
          previewUrl: null,
          isrc: null,
        },
        artists: item.track.artists.map((a) => ({ id: a.id, name: a.name, popularity: null, followers: null })),
      });
    }
  };

  addTracks(firstPage);
  url = firstPage.next;

  while (url && tracks.length < MAX_TRACKS) {
    const page = await fetchSpotifyData<SpotifyPlaylistTracksPage>(token, url);
    if (!page) break;
    addTracks(page);
    url = page.next;
  }

  return tracks;
};

// Helper
async function fetchSpotifyData<T>(token: string, endpoint: string): Promise<T | null> {
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status === 204 || response.status >= 400) return null;
  return (await response.json()) as T;
}

async function fetchSpotifyPlaylistFirstPage(
  token: string,
  url: string,
): Promise<SpotifyPlaylistTracksPage | "not_found" | null> {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 404) return "not_found";
  if (response.status === 204 || response.status >= 400) return null;
  return (await response.json()) as SpotifyPlaylistTracksPage;
}
