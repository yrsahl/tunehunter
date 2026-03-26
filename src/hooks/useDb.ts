import { api } from "@/lib/api";
import { Track } from "@/types/song-types";

const useDb = () => {
  const storeSong = api.song.storeSong.useMutation();

  // Store tracks in the database. Returns false if the request failed (e.g. rate limited).
  const storeTracksInDb = async (tracks: Track[]): Promise<boolean> => {
    const results = tracks.map((track) => {
      const { song, artists } = track;
      return {
        song: {
          id: song.id,
          title: song.title,
          duration: song.duration,
          album: song.album || null,
          albumArtUrl: song.albumArtUrl || null,
          year: song.year,
          genre: song.genre ?? null,
          spotifyId: song.spotifyId ?? null,
          isrc: null,
        },
        artists: artists.map((artist) => {
          return {
            id: artist.id,
            name: artist.name,
            popularity: null,
            followers: null,
          };
        }),
      };
    });
    try {
      await storeSong.mutateAsync(results);
      return true;
    } catch {
      return false;
    }
  };

  return { storeTracksInDb };
};

export default useDb;
