import { env } from "@/env";
import { SearchData } from "@/types/search-types";
import { Track } from "@/types/song-types";

const getEndpoint = () => env.NEXT_PUBLIC_ITUNES_PROXY_URL ?? "https://itunes.apple.com/search";

const SONG_LIMIT = 30;

type ItunesApiTrack = {
  wrapperType: string;
  kind: string;
  trackId: number;
  artistId: number;
  collectionId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  trackTimeMillis: number;
  releaseDate: string;
  primaryGenreName: string;
  trackViewUrl: string;
  previewUrl: string | null;
};

type ItunesApiResponse = {
  resultCount: number;
  results: ItunesApiTrack[];
};

const DURATION_WINDOW_MS = 3000;

const FETCH_TIMEOUT_MS = 8_000;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function titleMatches(resultTitle: string, searchTitle: string): boolean {
  const searchTokens = tokenize(searchTitle);
  if (searchTokens.length === 0) return true;
  const resultSet = new Set(tokenize(resultTitle));
  const matched = searchTokens.filter((t) => resultSet.has(t)).length;
  return matched / searchTokens.length >= 0.75;
}

function artistMatches(resultArtist: string, searchArtist: string): boolean {
  const resultNorm = resultArtist.toLowerCase().replace(/[^\w]/g, "");
  return tokenize(searchArtist).some((t) => resultNorm.includes(t));
}

export const fetchItunesTrack = async (
  title: string,
  artist: string,
  duration: number,
): Promise<Track | null> => {
  const params = new URLSearchParams({
    term: `${artist} ${title}`,
    media: "music",
    entity: "song",
    limit: SONG_LIMIT.toString(),
  });

  const response = await fetch(`${getEndpoint()}?${params}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) return null;

  const data = (await response.json()) as ItunesApiResponse;

  const candidates = data.results.filter(
    (r) =>
      r.wrapperType === "track" &&
      r.kind === "song" &&
      Math.abs(r.trackTimeMillis - duration) <= DURATION_WINDOW_MS &&
      titleMatches(r.trackName, title) &&
      artistMatches(r.artistName, artist),
  );

  if (candidates.length === 0) return null;

  const closest = candidates.reduce((best, r) =>
    Math.abs(r.trackTimeMillis - duration) < Math.abs(best.trackTimeMillis - duration) ? r : best,
  );

  return {
    song: {
      id: closest.trackId.toString(),
      title: closest.trackName,
      duration: closest.trackTimeMillis,
      album: closest.collectionName ?? null,
      albumArtUrl: closest.artworkUrl100 ?? "",
      year: closest.releaseDate?.substring(0, 10) ?? "",
      genre: closest.primaryGenreName ?? null,
      spotifyId: null,
      isrc: null,
    },
    artists: [
      {
        id: closest.artistId.toString(),
        name: closest.artistName,
        popularity: null,
        followers: null,
      },
    ],
  };
};

export const fetchItunesSearchData = async (query: string): Promise<SearchData | null> => {
  const params = new URLSearchParams({
    term: query,
    media: "music",
    entity: "song",
    limit: SONG_LIMIT.toString(),
  });

  const response = await fetch(`${getEndpoint()}?${params}`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) return null;

  const data = (await response.json()) as ItunesApiResponse;

  return {
    tracks: {
      href: `${getEndpoint()}?${params}`,
      items: data.results
        .filter((r) => r.wrapperType === "track" && r.kind === "song")
        .map((track) => ({
          song: {
            id: track.trackId.toString(),
            title: track.trackName,
            duration: track.trackTimeMillis,
            album: track.collectionName ?? null,
            albumArtUrl: track.artworkUrl100 ?? "",
            year: track.releaseDate?.substring(0, 10) ?? "",
            genre: track.primaryGenreName ?? null,
            spotifyId: null,
            isrc: null,
          },
          artists: [
            {
              id: track.artistId.toString(),
              name: track.artistName,
              popularity: null,
              followers: null,
            },
          ],
        })),
    },
  };
};
