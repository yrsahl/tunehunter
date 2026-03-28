import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { api } from "@/lib/api";
import useRegionSettings from "./settings/useRegionSettings";

const useFavorites = () => {
  const {
    favorites: { data, refetchData, isLoading },
  } = useSearchTabDataContext();
  const addUserActivity = api.userActivities.addUserActivity.useMutation();
  const removeUserActivity = api.userActivities.removeUserActivityByType.useMutation();
  const { region } = useRegionSettings();

  const isOnFavorites = (songId: string) => {
    if (isLoading || !data) return false;
    return data.some((item) => item.song.id === songId);
  };

  const addToFavorites = async (songId: string) => {
    if (isOnFavorites(songId)) return;
    await addUserActivity.mutateAsync({
      region,
      songId,
      type: "favorite",
    });
    refetchData();
  };

  const removeFromFavorites = async (songId: string) => {
    await removeUserActivity.mutateAsync({ songId, type: "favorite" });
    refetchData();
  };

  return {
    favoritesData: data,
    favoritesDataIsLoading: isLoading,
    isOnFavorites,
    addToFavorites,
    removeFromFavorites,
  };
};

export default useFavorites;
