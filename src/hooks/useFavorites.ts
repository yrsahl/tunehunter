import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { api } from "@/lib/api";
import { SpotifyTrack } from "@/types/song-types";
import useRegionSettings from "./settings/useRegionSettings";

const useFavorites = () => {
  const {
    favorites: { data, refetchData, isLoading },
  } = useSearchTabDataContext();
  const addUserActivity = api.userActivities.addUserActivity.useMutation();
  const addFavoritesFromPlaylist = api.userActivities.addFavoritesFromSpotifyPlaylist.useMutation();
  const removeUserActivity = api.userActivities.removeUserActivityByType.useMutation();
  const { region } = useRegionSettings();

  const isOnFavorites = (songId: string) => {
    if (isLoading || !data) return false;
    return data.some((item) => item.song.id === songId);
  };

  const addToFavorites = async (songId: string) => {
    if (isOnFavorites(songId)) return;
    await addUserActivity.mutateAsync({ region, songId, type: "favorite" });
    refetchData();
  };

  const addAllToFavorites = async (tracks: SpotifyTrack[]) => {
    const result = await addFavoritesFromPlaylist.mutateAsync({
      region,
      tracks: tracks
        .filter((t) => !!t.song.spotifyId)
        .map((t) => ({
          song: {
            spotifyId: t.song.spotifyId!,
            title: t.song.title,
            duration: t.song.duration,
            album: t.song.album ?? null,
            albumArtUrl: t.song.albumArtUrl ?? null,
            year: t.song.year,
          },
          artists: t.artists.map((a) => ({ id: a.id, name: a.name })),
        })),
    });
    refetchData();
    return result;
  };

  const removeFromFavorites = async (songId: string) => {
    await removeUserActivity.mutateAsync({ songId, type: "favorite" });
    refetchData();
  };

  return {
    favoritesData: data,
    favoritesDataIsLoading: isLoading,
    isAddingAllToFavorites: addFavoritesFromPlaylist.isLoading,
    isOnFavorites,
    addToFavorites,
    addAllToFavorites,
    removeFromFavorites,
  };
};

export default useFavorites;
