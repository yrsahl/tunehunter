import IconButton from "@/components/IconButton";
import { useSongListingContext } from "@/contexts/SongListingContext";
import useDeviceSize from "@/hooks/useDeviceSize";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CountryCode } from "@/lib/validators";
import { SongVendorType } from "@/server/db/schema";
import { transformCurrencyStringToIcon, withAffiliateTag } from "@/services/vendors";
import { motion } from "framer-motion";
import { track } from "@/lib/plausible";
import SongListingRowMessage from "./SongListingRowMessage";
import SongListingRowSkeleton from "./SongListingRowSkeleton";
import VendorLogo from "./VendorLogo";

interface SongListingRowProps {
  vendor: SongVendorType;
  region: CountryCode;
}

const SongListingRow = ({ vendor, region }: SongListingRowProps) => {
  const { getVendorResponse, getVendorResponseLoadingState } = useSongListingContext();
  const vendorResponse = getVendorResponse(vendor);
  const isVendorResponseLoading = getVendorResponseLoadingState(vendor);

  const { isSmallDevice } = useDeviceSize();
  const addUserActivity = api.userActivities.addUserActivity.useMutation();

  // Skeleton
  if (isVendorResponseLoading || (vendorResponse && vendorResponse.error === "INVALID_FIELDS"))
    return <SongListingRowSkeleton store={vendor} region={region} />;

  // Store unreachable (timeout)
  if (vendorResponse?.error === "STORE_UNREACHABLE") {
    return <SongListingRowMessage message="Store not reachable." store={vendor} region={region} />;
  }

  // Rate limited
  if (vendorResponse?.error === "RATE_LIMITED") {
    return (
      <SongListingRowMessage
        message="Rate limited — try again shortly."
        store={vendor}
        region={region}
      />
    );
  }

  // No data
  if (!vendorResponse || !vendorResponse?.data || vendorResponse.error === "NO_DATA_FOUND") {
    return (
      <SongListingRowMessage
        message="Not available in this store."
        store={vendor}
        region={region}
      />
    );
  }

  // Extract data
  const { data } = vendorResponse;
  const {
    currency,
    price,
    url,
    songId,
    songVendor: { artistsShare, quality, format },
  } = data;

  // Visit Vendor
  const visitVendor = async () => {
    // Open site
    window.open(withAffiliateTag(url), "_blank");

    track("Vendor Link Clicked", { vendor });

    // Add activity
    addUserActivity.mutate({ region, songId, type: "store_visit" });
  };

  return (
    <motion.tr whileHover={{ scale: 1.03 }} className="cursor-pointer" onClick={visitVendor}>
      {/* Store */}
      <td className={cn(isSmallDevice && "pr-2")}>
        <VendorLogo store={vendor} region={region} />
      </td>

      {/* Quality */}
      <td>
        <div className="flex flex-col justify-center text-sm sm:pl-0 sm:text-base md:justify-normal">
          <span>{format}</span>
          {quality !== "Multiple" && (
            <span className="text-xs opacity-50 md:text-sm">{quality}</span>
          )}
        </div>
      </td>

      {/* Price */}
      <td>
        <div className="flex justify-center gap-4 text-sm sm:justify-normal sm:text-base">
          <div className="inline-block">
            {price === "0" && vendor === "bandcamp" ? (
              <span className="text-muted-foreground">
                From {transformCurrencyStringToIcon(currency)}0
              </span>
            ) : price != null ? (
              <>
                {price}
                {transformCurrencyStringToIcon(currency)}
              </>
            ) : (
              <span className="text-muted-foreground">See store</span>
            )}
          </div>
        </div>
      </td>

      {/* Artist's share */}
      <td className="hidden sm:table-cell md:hidden lg:table-cell">
        {price == null ? (
          <span className="flex w-full items-center justify-center text-muted-foreground">-</span>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="h-1 w-[80%] rounded-full bg-primary/20 md:h-2">
              {artistsShare && (
                <div
                  className="h-1 rounded-full bg-success md:h-2"
                  style={{ width: `${artistsShare}%` }}
                />
              )}
            </div>
          </div>
        )}
      </td>

      {/* Link */}
      <td>
        <div className="flex justify-end md:justify-start">
          <IconButton
            size="icon"
            variant="ghost"
            icon="externalArrow"
            iconSize={isSmallDevice ? "20px" : "24px"}
          />
        </div>
      </td>
    </motion.tr>
  );
};

export default SongListingRow;
