import { SpotifyTrack } from "@/types/spotify";
import { api } from "@/utils/api";

const useDb = () => {
  const storeQueryResults = api.song.storeQueryResults.useMutation();

  // Store tracks in the database
  const storeTracksInDb = (tracks: SpotifyTrack[]) => {
    const results = tracks.map((track) => {
      return {
        song: {
          id: track.id,
          title: track.name,
          duration: track.duration_ms,
          album: track.album.name || null,
          albumArtUrl: track.album.images[0]?.url || null,
          year: track.album.release_date,
          genre: track.album.album_type,
          spotifyUrl: track.external_urls.spotify,
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
    storeQueryResults.mutate(results);
  };

  return { storeTracksInDb };
};

export default useDb;
