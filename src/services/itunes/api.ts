import { SearchData, SearchTrack } from "@/types/search-types";

const ITUNES_SEARCH_ENDPOINT = "https://itunes.apple.com/search";
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

export const fetchItunesTrack = async (
  query: string,
  duration: number,
): Promise<SearchTrack | null> => {
  const params = new URLSearchParams({
    term: query,
    media: "music",
    entity: "song",
    limit: SONG_LIMIT.toString(),
  });

  const response = await fetch(`${ITUNES_SEARCH_ENDPOINT}?${params}`);
  if (!response.ok) return null;

  const data = (await response.json()) as ItunesApiResponse;

  const candidates = data.results.filter(
    (r) =>
      r.wrapperType === "track" &&
      r.kind === "song" &&
      Math.abs(r.trackTimeMillis - duration) <= DURATION_WINDOW_MS,
  );

  if (candidates.length === 0) return null;

  const closest = candidates.reduce((best, r) =>
    Math.abs(r.trackTimeMillis - duration) < Math.abs(best.trackTimeMillis - duration) ? r : best,
  );

  return {
    id: closest.trackId.toString(),
    name: closest.trackName,
    duration_ms: closest.trackTimeMillis,
    artists: [{ id: closest.artistId.toString(), name: closest.artistName }],
    album: {
      name: closest.collectionName ?? null,
      images: closest.artworkUrl100 ? [{ url: closest.artworkUrl100 }] : [],
      release_date: closest.releaseDate?.substring(0, 10) ?? "",
    },
  };
};

export const fetchItunesSearchData = async (query: string): Promise<SearchData | null> => {
  const params = new URLSearchParams({
    term: query,
    media: "music",
    entity: "song",
    limit: SONG_LIMIT.toString(),
  });

  const response = await fetch(`${ITUNES_SEARCH_ENDPOINT}?${params}`);
  if (!response.ok) return null;

  const data = (await response.json()) as ItunesApiResponse;

  return {
    tracks: {
      href: `${ITUNES_SEARCH_ENDPOINT}?${params}`,
      items: data.results
        .filter((r) => r.wrapperType === "track" && r.kind === "song")
        .map((track) => ({
          id: track.trackId.toString(),
          name: track.trackName,
          duration_ms: track.trackTimeMillis,
          storeUrl: track.trackViewUrl ?? "",
          artists: [{ id: track.artistId.toString(), name: track.artistName }],
          album: {
            name: track.collectionName ?? null,
            images: track.artworkUrl100 ? [{ url: track.artworkUrl100 }] : [],
            release_date: track.releaseDate?.substring(0, 10) ?? "",
          },
        })),
    },
  };
};
