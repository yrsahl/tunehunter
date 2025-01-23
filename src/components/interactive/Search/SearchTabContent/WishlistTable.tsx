import { useSearchTabData } from "@/contexts/SearchTabDataContext";

const WishlistTable = () => {
  const {
    wishlist: { data, refetchData, isLoading },
  } = useSearchTabData();

  const wishlistData = data!; // Must exist due to checks in parent

  return <table className="w-full"></table>;
};

export default WishlistTable;
