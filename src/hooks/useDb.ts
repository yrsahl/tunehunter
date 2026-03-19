import { api } from "@/lib/api";
import { SearchTrack } from "@/types/search-types";

const useDb = () => {
  const storeQueryResults = api.song.storeQueryResults.useMutation();

  // Store tracks in the database
  const storeTracksInDb = async (tracks: SearchTrack[]) => {
    const results = tracks.map((track) => {
      return {
        song: {
          id: track.id,
          title: track.name,
          duration: track.duration_ms,
          album: track.album.name || null,
          albumArtUrl: track.album.images[0]?.url || null,
          year: track.album.release_date,
          spotifyId: null,
          isrc: null,
        },
        artists: track.artists.map((artist) => {
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
