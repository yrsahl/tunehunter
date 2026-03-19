import { SearchData } from "@/types/search-types";
import { Track } from "@/types/song-types";

const MB_SEARCH_ENDPOINT = "https://musicbrainz.org/ws/2/recording";
const SONG_LIMIT = 30;

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

export const fetchMusicBrainzSearchData = async (query: string): Promise<SearchData | null> => {
  const params = new URLSearchParams({
    query,
    fmt: "json",
    limit: SONG_LIMIT.toString(),
    dismax: "true",
    inc: "isrcs",
  });

  const response = await fetch(`${MB_SEARCH_ENDPOINT}?${params}`);
  if (!response.ok) return null;

  const data = (await response.json()) as MbResponse;

  return {
    tracks: {
      href: `${MB_SEARCH_ENDPOINT}?${params}`,
      items: data.recordings.map((recording) => {
        const firstRelease = recording.releases?.[0];
        const artworkUrl = firstRelease
          ? `https://coverartarchive.org/release/${firstRelease.id}/front-250`
          : null;
        const releaseDate =
          recording["first-release-date"] ?? firstRelease?.date ?? "";

        return {
          song: {
            id: recording.id,
            title: recording.title,
            duration: recording.length ?? 0,
            album: firstRelease?.title ?? null,
            albumArtUrl: artworkUrl ?? "",
            year: releaseDate,
            spotifyId: null,
            isrc: recording.isrcs?.[0] ?? null,
          },
          artists: recording["artist-credit"].map((ac) => ({
            id: ac.artist.id,
            name: ac.artist.name,
            popularity: null,
            followers: null,
          })),
        } satisfies Track;
      }),
    },
  };
};
