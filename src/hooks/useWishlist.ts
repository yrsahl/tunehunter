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

  const addToWishlist = (songId: string) => {
    if (isOnWishlist(songId)) return;
    addUserActivity.mutate({
      region,
      songId,
      type: "wishlist",
    });
    refetchData();
  };

  const removeFromWishlist = (songId: string) => {
    removeUserActivity.mutate({ songId, type: "wishlist" });
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
