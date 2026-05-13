import { useSongListingContext } from "@/contexts/SongListingContext";
import useDeviceSize from "@/hooks/useDeviceSize";
import { CountryCode } from "@/lib/validators";
import { songVendorArray } from "@/server/db/schema";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import SongPreview from "./SongPreview";
const SongListingRow = dynamic(() => import("./SongListingRow"), {
  ssr: false,
});

interface ISongListingsProps {
  region: CountryCode;
}

const SongListingsContainer = ({ region }: ISongListingsProps) => {
  const { trackData, isTrackDataLoading, getVendorResponse } = useSongListingContext();
  const { isExtraSmallDevice } = useDeviceSize();

  const hasLosslessOption =
    !!getVendorResponse("beatport")?.data || !!getVendorResponse("bandcamp")?.data;

  return (
    <div
      data-testid="song-listings"
      className="hide-scrollbars flex flex-col gap-0 overflow-hidden overflow-x-auto sm:min-h-96 md:flex-row md:gap-12"
    >
      <SongPreview trackData={trackData ?? undefined} isLoading={isTrackDataLoading} />
      <div className="flex flex-col md:w-1/2">
        <table className="mx-auto my-auto table w-[85%] border-separate border-spacing-y-5 sm:border-spacing-y-5 md:w-full md:border-spacing-y-6">
          {!isExtraSmallDevice && (
            <thead>
              <tr>
                <td className="w-20 normal-case opacity-0 sm:w-[70px] md:text-base">Logo</td>
                <td className="w-28 text-[15px] font-bold sm:w-24 md:text-base">Quality</td>
                <td className="w-20 text-[15px] font-bold md:text-base">
                  Price
                  {/* <sub className="pl-[2px] text-[10px] font-light text-foreground/40">{region}</sub> */}
                </td>
                <td className="hidden w-36 text-[15px] font-bold sm:table-cell md:hidden md:text-base lg:table-cell">
                  Artist's share
                </td>
                <td className="w-8 text-[15px] font-bold opacity-0 sm:w-10 md:text-base">Link</td>
              </tr>
            </thead>
          )}
          <tbody>
            {songVendorArray.map((songVendor) => (
              <SongListingRow key={songVendor} vendor={songVendor} region={region} />
            ))}
          </tbody>
        </table>
        <div className="mx-auto flex w-[83%] flex-col items-center gap-0.5">
          <p className="text-center text-xs text-foreground/40 sm:hidden">
            Prices shown for{" "}
            {new Intl.DisplayNames(["en"], { type: "region" }).of(region) ?? region}.
          </p>
          <motion.p
            animate={{ opacity: hasLosslessOption ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            className="text-center text-xs text-foreground/40"
          >
            *Uncompressed and/or lossless options also available
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default SongListingsContainer;
