import IconButton from "@/components/IconButton";
import { CountryCode } from "@/helpers/region";
import useDeviceSize from "@/hooks/useDeviceSize";
import { SongListingResponse } from "@/server/api/schemas/song-listings-schemas";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import SongListingRowMessage from "./SongListingRowMessage";
import SongListingRowSkeleton from "./SongListingRowSkeleton";
import VendorLogo from "./VendorLogo";

interface SongListingRowProps {
  store: string;
  region: CountryCode;
  songListingData: SongListingResponse;
  isDataLoading: boolean;
}

const SongListingRow = ({ store, region, songListingData, isDataLoading }: SongListingRowProps) => {
  const { isSmallDevice } = useDeviceSize();
  const addUserActivity = api.userActivities.addUserActivity.useMutation();

  // Skeleton
  if (isDataLoading || (songListingData && songListingData.error === "INVALID_FIELDS"))
    return <SongListingRowSkeleton store={store} region={region} />;

  // No data
  if (!songListingData.data || songListingData.error === "NO_DATA_FOUND") {
    return (
      <SongListingRowMessage message="Not available in this store." store={store} region={region} />
    );
  }

  // Extract data
  const { format, songId, url, quality, price, currency } = songListingData.data;
  const artistsShare = 0.7;

  // Visit Vendor
  const visitVendor = async () => {
    // Open site
    window.open(url, "_blank");

    // Add activity
    addUserActivity.mutateAsync({ region, songId, type: "store_visit" });
  };

  return (
    <motion.tr whileHover={{ scale: 1.03 }} className="cursor-pointer" onClick={visitVendor}>
      {/* Store */}
      <td>
        <VendorLogo store={store} region={region} />
      </td>

      {/* Quality */}
      <td>
        <div className="flex flex-col justify-center text-sm md:text-base">
          <span>{format}</span>
          <span className="text-xs opacity-50 md:text-sm">{quality}</span>
        </div>
      </td>

      {/* Price */}
      <td>
        <div className="flex items-center gap-4 text-sm md:text-base">
          <div className="inline-block">
            {price}
            {currency}
          </div>
        </div>
      </td>

      {/* Artist's share */}
      <td>
        <div className="flex flex-col gap-1">
          <div className="h-1 w-[80%] rounded-full bg-primary/20 md:h-2">
            {artistsShare && (
              <div
                className="h-1 rounded-full bg-success md:h-2"
                style={{ width: `${artistsShare * 100}%` }}
              />
            )}
          </div>
        </div>
      </td>

      {/* Link */}
      <td>
        <IconButton
          size="icon"
          variant="ghost"
          icon="externalArrow"
          iconSize={isSmallDevice ? "20px" : "24px"}
          className="border-none"
        />
      </td>
    </motion.tr>
  );
};

export default SongListingRow;
