import IconButton from "@/components/IconButton";
import { countryNamesEnglish } from "@/helpers/region";
import { Vendor, VendorTrack } from "@/types/vendor";
import { motion } from "framer-motion";

interface ISearchResultsRowProps {
  track: VendorTrack;
  vendor: Vendor;
}

const VendorResultsRow = ({ track, vendor }: ISearchResultsRowProps) => {
  const { artistsShare, region, store } = vendor;
  const { fileData, trackData } = track;

  return (
    <motion.tr
      whileHover={{ scale: 1.03 }}
      className="cursor-pointer"
      onClick={() => {
        window.open(track.trackData.url, "_blank");
      }}
    >
      {/* Store */}
      <td>
        <div className="flex items-center space-x-5">
          <div className="avatar ">
            <div className="mask mask-squircle h-12 w-12">
              <img src={`logos/${store.toLowerCase()}.svg`} alt="Avatar Tailwind CSS Component" />
            </div>
          </div>
          <div className="hidden">
            <div className="font-bold">{store}</div>
            <div className="text-sm font-normal opacity-50">
              {countryNamesEnglish[region.toUpperCase()]}
            </div>
          </div>
        </div>
      </td>

      {/* Quality */}
      <td>
        <div className="flex flex-col justify-center">
          <span>{fileData.format}</span>
          <span className="text-sm opacity-50">{fileData.quality}</span>
        </div>
      </td>

      {/* Price */}
      <td>
        <div className="flex items-center gap-4">
          <div className="inline-block">
            {trackData.price}
            {trackData.currency}
          </div>
          <div className="flex flex-1 justify-center">
            <a href="{vendorData.song.songLink}" target="_blank">
              <button className="btn btn-secondary btn-ghost text-base normal-case">
                {/* <FaExternalLinkSquareAlt size={32} className="text-secondary" /> */}
              </button>
            </a>
          </div>
        </div>
      </td>

      {/* Artist's share */}
      <td>
        <div className="flex flex-col gap-1">
          <div className="h-2 w-[80%] rounded-full bg-primary/20">
            {artistsShare && (
              <div
                className="h-2 rounded-full bg-success"
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
          iconSize="24px"
          className="border-none"
        />
      </td>
    </motion.tr>
  );
};

export default VendorResultsRow;
