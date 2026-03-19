import { useSongListingContext } from "@/contexts/SongListingContext";
import useDeviceSize from "@/hooks/useDeviceSize";
import { CountryCode } from "@/lib/validators";
import { songVendorArray } from "@/server/db/schema";
import dynamic from "next/dynamic";
import SongPreview from "./SongPreview";
const SongListingRow = dynamic(() => import("./SongListingRow"), {
  ssr: false,
});

interface ISongListingsProps {
  region: CountryCode;
}

const SongListingsContainer = ({ region }: ISongListingsProps) => {
  const { trackData, isSongDataLoading } = useSongListingContext();
  const { isExtraSmallDevice } = useDeviceSize();

  return (
    <div className="hide-scrollbars flex flex-col gap-0 overflow-hidden overflow-x-auto sm:h-96 md:flex-row md:gap-12">
      <SongPreview trackData={trackData ?? undefined} isLoading={isSongDataLoading} />
      <table className="mx-auto my-auto table w-[83%] border-separate border-spacing-y-4 sm:h-[80%] sm:border-spacing-y-5 md:w-1/2 md:border-spacing-y-6">
        {!isExtraSmallDevice && (
          <thead>
            <tr>
              <td className="w-20 normal-case opacity-0 sm:w-[70px] md:text-base">Logo</td>
              <td className="w-28 text-[15px] font-bold sm:w-24 md:text-base">Quality</td>
              <td className="w-20 text-[15px] font-bold md:text-base">Price</td>
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
    </div>
  );
};

export default SongListingsContainer;
