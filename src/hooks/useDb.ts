import { api } from "@/lib/api";
import { generateSongId } from "@/lib/songId";
import { SearchTrack } from "@/types/search-types";

const useDb = () => {
  const storeQueryResults = api.song.storeQueryResults.useMutation();

  // Store tracks in the database
  const storeTracksInDb = (tracks: SearchTrack[]) => {
    const results = tracks.map((track) => {
      return {
        song: {
          id: generateSongId(track.name, track.artists[0]?.name ?? ""),
          title: track.name,
          duration: track.duration_ms,
          album: track.album.name || null,
          albumArtUrl: track.album.images[0]?.url || null,
          year: track.album.release_date,
          spotifyUrl: track.storeUrl,
          isrc: track.isrc ?? null,
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
