import { InfoIcon } from "lucide-react";

interface ISearchResultsRowProps {
  vendorData: any;
}

export default function SearchResultsRow() {
  return (
    <tr>
      <td>
        <div className="flex items-center space-x-5">
          <div className="avatar ">
            <div className="mask mask-squircle h-12 w-12">
              <img src={""} alt="Avatar Tailwind CSS Component" />
            </div>
          </div>
          <div className="hidden md:block">
            <div className="font-bold">Apple Music</div>
            <div className="text-sm font-normal opacity-50">Germany</div>
          </div>
        </div>
      </td>
      <td>
        <div>WAV</div>
        <div className="text-sm opacity-50">320kbps</div>
      </td>
      <td className="">
        {/* {vendorData.song.price &&
          (Math.round(vendorData.song.price * artistsShare * 100) / 100).toFixed(2)} */}
        0.29€
        <span
          className="tooltip ml-1 inline-block rounded-full text-sm opacity-80"
          data-tip={`Artist's share is 33% on Amazon.`}
        >
          {/* <AiOutlineInfoCircle size={16} /> */}
          <InfoIcon />
        </span>
        {/* <InfoAnnotation
          infoText={}
        /> */}
      </td>
      <td>
        <div className="flex items-center gap-4">
          <div className="inline-block">0.99€</div>
          <div className="flex flex-1 justify-center">
            <a href="{vendorData.song.songLink}" target="_blank">
              <button className="btn btn-secondary btn-ghost text-base normal-case">
                {/* <FaExternalLinkSquareAlt size={32} className="text-secondary" /> */}
              </button>
            </a>
          </div>
        </div>
      </td>
    </tr>
  );
}
