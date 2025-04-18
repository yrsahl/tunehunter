import { useVendorDataContext } from "@/contexts/SearchDataContext";
import { api } from "@/utils/api";
import SearchResultsRow from "./SearchResultsRow";
import SearchResultsTrack from "./SearchResultsTrack";

interface ISearchResultsProps {
  songId: string;
}

const SearchResultsTable = ({ songId }: ISearchResultsProps) => {
  // 1. Fetch song data
  const { data: songData } = api.song.getSongById.useQuery({ id: songId!! }, { enabled: !!songId });
  // 2. Fetch vendor data
  const { vendorData } = useVendorDataContext();

  return (
    <div className="flex h-96 w-11/12 flex-row gap-8 overflow-x-auto">
      <SearchResultsTrack songData={songData} />
      <table className="table w-full">
        <thead>
          <tr>
            <td className="text-base normal-case">Store</td>
            <td className="text-base normal-case">Quality</td>
            <td className="text-base normal-case">Artist's Share</td>
            <td className="text-base normal-case">Price</td>
          </tr>
        </thead>
        <tbody>
          <SearchResultsRow />
          {/* {vendorData.amazon && <SearchResultsRow vendorData={vendorData.amazon} />}
          {vendorData.bandcamp && <SearchResultsRow vendorData={vendorData.bandcamp} />}
          {vendorData.beatport && <SearchResultsRow vendorData={vendorData.beatport} />}
          {vendorData.apple && <SearchResultsRow vendorData={vendorData.apple} />} */}
        </tbody>
      </table>
    </div>
  );
};

export default SearchResultsTable;
