import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { api } from "@/utils/api";
import useRegionSettings from "./settings/useRegionSettings";

const useWishlist = () => {
  const {
    wishlist: { data, refetchData, isLoading },
  } = useSearchTabDataContext();
  const addUserActivity = api.userActivities.addUserActivity.useMutation();
  const removeUserActivity = api.userActivities.removeUserActivityByType.useMutation();
  const { region } = useRegionSettings();

  const isOnWishlist = (songId: string) => {
    if (isLoading || !data) return false;
    return data.some((item) => item.song.id === songId);
  };

  const addToWishlist = async (songId: string) => {
    if (isOnWishlist(songId)) return;
    await addUserActivity.mutateAsync({
      region,
      songId,
      type: "wishlist",
    });
    refetchData();
  };

  const removeFromWishlist = async (songId: string) => {
    await removeUserActivity.mutateAsync({ songId, type: "wishlist" });
    refetchData();
  };

  return {
    wishlistData: data,
    wishlistDataIsLoading: isLoading,
    isOnWishlist,
    addToWishlist,
    removeFromWishlist,
  };
};

export default useWishlist;
