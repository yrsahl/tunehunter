import { SearchData } from "@/types/search-types";
import { Track } from "@/types/song-types";

const DEEZER_SEARCH_ENDPOINT = "https://api.deezer.com/search";
const SONG_LIMIT = 30;
const DURATION_WINDOW_MS = 3000;

type DeezerArtist = {
  id: number;
  name: string;
};

type DeezerTrack = {
  id: number;
  title: string;
  duration: number; // in seconds
  release_date?: string;
  artist: DeezerArtist;
  contributors?: DeezerArtist[];
  album: {
    id: number;
    title: string;
    cover_medium: string;
    release_date?: string;
  };
  isrc?: string;
};

type DeezerResponse = {
  data: DeezerTrack[];
  total: number;
  next?: string;
};

const toTrack = (track: DeezerTrack): Track => {
  const trackArtists = (track.contributors?.length ? track.contributors : [track.artist]).map(
    (a) => ({
      id: a.id.toString(),
      name: a.name,
      popularity: null,
      followers: null,
    }),
  );

  return {
    song: {
      id: track.id.toString(),
      title: track.title,
      duration: track.duration * 1000,
      album: track.album.title ?? null,
      albumArtUrl: track.album.cover_medium ?? "",
      year: track.release_date ?? track.album.release_date ?? "",
      spotifyId: null,
      isrc: track.isrc ?? null,
    },
    artists: trackArtists,
  };
};

export const fetchDeezerTrack = async (query: string, duration: number): Promise<Track | null> => {
  const params = new URLSearchParams({
    q: query,
    limit: SONG_LIMIT.toString(),
    output: "json",
  });

  const response = await fetch(`${DEEZER_SEARCH_ENDPOINT}?${params}`);
  if (!response.ok) return null;

  const data = (await response.json()) as DeezerResponse;

  const candidates = data.data.filter(
    (t) => Math.abs(t.duration * 1000 - duration) <= DURATION_WINDOW_MS,
  );
  if (candidates.length === 0) return null;

  const closest = candidates.reduce((best, t) =>
    Math.abs(t.duration * 1000 - duration) < Math.abs(best.duration * 1000 - duration) ? t : best,
  );

  return toTrack(closest);
};

export const fetchDeezerSearchData = async (query: string): Promise<SearchData | null> => {
  const params = new URLSearchParams({
    q: query,
    limit: SONG_LIMIT.toString(),
    output: "json",
  });

  const response = await fetch(`${DEEZER_SEARCH_ENDPOINT}?${params}`);
  if (!response.ok) return null;

  const data = (await response.json()) as DeezerResponse;
  if (!data.data?.length) return null;

  return {
    tracks: {
      href: `${DEEZER_SEARCH_ENDPOINT}?${params}`,
      items: data.data.map(toTrack),
    },
  };
};
