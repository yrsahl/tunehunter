import { SearchData } from "@/types/search-types";
import { Track } from "@/types/song-types";

const MB_SEARCH_ENDPOINT = "https://musicbrainz.org/ws/2/recording";
const SONG_LIMIT = 30;
const DURATION_WINDOW_MS = 3000;
const MB_HEADERS = {
  "User-Agent": "trackscout/0.1.0 (https://github.com/trackscout)",
  Accept: "application/json",
};

type MbArtistCredit = {
  name: string;
  joinphrase?: string;
  artist: {
    id: string;
    name: string;
    "sort-name": string;
  };
};

type MbRelease = {
  id: string;
  title: string;
  date?: string;
};

type MbRecording = {
  id: string;
  score: number;
  title: string;
  length: number | null;
  "first-release-date"?: string;
  "artist-credit": MbArtistCredit[];
  releases: MbRelease[];
  isrcs?: string[];
};

type MbResponse = {
  recordings: MbRecording[];
  count: number;
  offset: number;
};

const toTrack = (recording: MbRecording): Track => {
  const firstRelease = recording.releases?.[0];
  return {
    song: {
      id: recording.id,
      title: recording.title,
      duration: recording.length ?? 0,
      album: firstRelease?.title ?? null,
      albumArtUrl: firstRelease
        ? `https://coverartarchive.org/release/${firstRelease.id}/front-250`
        : "",
      year: recording["first-release-date"] ?? firstRelease?.date ?? "",
      genre: null,
      spotifyId: null,
      isrc: recording.isrcs?.[0] ?? null,
    },
    artists: recording["artist-credit"].map((ac) => ({
      id: ac.artist.id,
      name: ac.artist.name,
      popularity: null,
      followers: null,
    })),
  };
};

export const fetchMusicBrainzTrack = async (query: string, duration: number): Promise<Track | null> => {
  const params = new URLSearchParams({
    query,
    fmt: "json",
    limit: SONG_LIMIT.toString(),
    dismax: "true",
    inc: "isrcs",
  });

  const response = await fetch(`${MB_SEARCH_ENDPOINT}?${params}`, { headers: MB_HEADERS });
  if (!response.ok) return null;

  const data = (await response.json()) as MbResponse;

  const candidates = data.recordings.filter(
    (r) => r.length != null && Math.abs(r.length - duration) <= DURATION_WINDOW_MS,
  );
  if (candidates.length === 0) return null;

  const closest = candidates.reduce((best, r) =>
    Math.abs((r.length ?? 0) - duration) < Math.abs((best.length ?? 0) - duration) ? r : best,
  );

  return toTrack(closest);
};

export const fetchMusicBrainzSearchData = async (query: string): Promise<SearchData | null> => {
  const params = new URLSearchParams({
    query,
    fmt: "json",
    limit: SONG_LIMIT.toString(),
    dismax: "true",
    inc: "isrcs",
  });

  const response = await fetch(`${MB_SEARCH_ENDPOINT}?${params}`, { headers: MB_HEADERS });
  if (!response.ok) return null;

  const data = (await response.json()) as MbResponse;

  return {
    tracks: {
      href: `${MB_SEARCH_ENDPOINT}?${params}`,
      items: data.recordings.map(toTrack),
    },
  };
};
