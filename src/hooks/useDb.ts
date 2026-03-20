import { api } from "@/lib/api";
import { Track } from "@/types/song-types";

const useDb = () => {
  const storeQueryResults = api.song.storeQueryResults.useMutation();

  // Store tracks in the database
  const storeTracksInDb = async (tracks: Track[]) => {
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
          spotifyId: null,
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
    await storeQueryResults.mutateAsync(results);
  };

  return { storeTracksInDb };
};

export default useDb;
