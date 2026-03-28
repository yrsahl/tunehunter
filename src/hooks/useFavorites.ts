import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { api } from "@/lib/api";
import { SpotifyTrack } from "@/types/song-types";
import useRegionSettings from "./settings/useRegionSettings";

const useFavorites = () => {
  const {
    favorites: { data, refetchData, isLoading },
  } = useSearchTabDataContext();
  const addUserActivity = api.userActivities.addUserActivity.useMutation();
  const addFavoriteFromSpotifyTrack = api.userActivities.addFavoriteFromSpotifyTrack.useMutation();
  const removeUserActivity = api.userActivities.removeUserActivityByType.useMutation();
  const { region } = useRegionSettings();

  const isOnFavorites = (songId: string) => {
    if (isLoading || !data) return false;
    return data.some((item) => item.song.id === songId);
  };

  const isOnFavoritesBySpotifyId = (spotifyId: string) => {
    if (isLoading || !data) return false;
    return data.some((item) => item.song.spotifyId === spotifyId);
  };

  const addToFavorites = async (songId: string) => {
    if (isOnFavorites(songId)) return;
    await addUserActivity.mutateAsync({ region, songId, type: "favorite" });
    refetchData();
  };

  const addToFavoritesFromSpotifyTrack = async (track: SpotifyTrack) => {
    if (!track.song.spotifyId || isOnFavoritesBySpotifyId(track.song.spotifyId)) return;
    await addFavoriteFromSpotifyTrack.mutateAsync({
      region,
      song: {
        spotifyId: track.song.spotifyId,
        title: track.song.title,
        duration: track.song.duration,
        album: track.song.album ?? null,
        albumArtUrl: track.song.albumArtUrl ?? null,
        year: track.song.year,
      },
      artists: track.artists.map((a) => ({ id: a.id, name: a.name })),
    });
    refetchData();
  };

  const removeFromFavorites = async (songId: string) => {
    await removeUserActivity.mutateAsync({ songId, type: "favorite" });
    refetchData();
  };

  const removeFromFavoritesBySpotifyId = async (spotifyId: string) => {
    await removeFromFavorites(`sp_${spotifyId}`);
  };

  return {
    favoritesData: data,
    favoritesDataIsLoading: isLoading,
    isOnFavorites,
    isOnFavoritesBySpotifyId,
    addToFavorites,
    addToFavoritesFromSpotifyTrack,
    removeFromFavorites,
    removeFromFavoritesBySpotifyId,
  };
};

export default useFavorites;
