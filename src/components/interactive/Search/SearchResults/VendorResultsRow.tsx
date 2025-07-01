import IconButton from "@/components/IconButton";
import useDeviceSize from "@/hooks/useDeviceSize";
import { Vendor, VendorTrack } from "@/types/vendor";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import VendorLogo from "./VendorLogo";

interface ISearchResultsRowProps {
  track: VendorTrack;
  vendor: Vendor;
  region: string;
  store: string;
}

const VendorResultsRow = ({ track, vendor, region, store }: ISearchResultsRowProps) => {
  const { artistsShare } = vendor; // TODO: Get region and store from here later when all stores are implemented
  const { fileData, trackData } = track;
  const { isSmallDevice } = useDeviceSize();
  const addUserActivity = api.userActivities.addUserActivity.useMutation();

  // Visit Vendor
  const visitVendor = () => {
    // Open site
    window.open(track.trackData.url, "_blank");

    // Add activity
    addUserActivity.mutate({ region, songId: trackData.id, type: "store_visit" });
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
          <span>{fileData.format}</span>
          <span className="text-xs opacity-50 md:text-sm">{fileData.quality}</span>
        </div>
      </td>

      {/* Price */}
      <td>
        <div className="flex items-center gap-4 text-sm md:text-base">
          <div className="inline-block">
            {trackData.price}
            {trackData.currency}
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

export default VendorResultsRow;
