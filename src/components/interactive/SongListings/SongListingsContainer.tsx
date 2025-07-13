import { useSongListingContext } from "@/contexts/SongListingContext";
import { CountryCode } from "@/helpers/region";
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
  const { songData, isSongDataLoading } = useSongListingContext();

  return (
    <div className="hide-scrollbars flex h-96 flex-row gap-12 overflow-hidden overflow-x-auto">
      <div className="my-auto hidden w-1/2 md:block">
        <SongPreview songData={songData} isLoading={isSongDataLoading} />
      </div>

      <table className="my-auto table h-[80%] w-full border-separate border-spacing-y-4 sm:border-spacing-y-6 md:w-1/2">
        <thead>
          <tr>
            <td className="w-20 text-sm font-bold normal-case opacity-0 sm:w-[70px] md:text-base">
              Logo
            </td>
            <td className="w-28 text-sm font-bold sm:w-24 md:text-base">Quality</td>
            <td className="w-20 text-sm font-bold md:text-base">Price</td>
            <td className="w-36 text-sm font-bold md:text-base">Artist's share</td>
            <td className="w-8 text-sm font-bold opacity-0 sm:w-10 md:text-base">Link</td>
          </tr>
        </thead>
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
