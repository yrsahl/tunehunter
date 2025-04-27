import { useSearchDataContext } from "@/contexts/SearchDataContext";
import { CountryCode } from "@/helpers/region";
import SearchResultsTrack from "./SearchResultsTrack";
import VendorResults from "./VendorResults";

interface ISearchResultsProps {
  region: CountryCode;
}

const SearchResultsFrame = ({ region }: ISearchResultsProps) => {
  const { songData, isSongDataLoading, iTunesData, isItunesDataLoading } = useSearchDataContext();

  return (
    <div className="hide-scrollbars flex h-96 flex-row gap-12 overflow-hidden overflow-x-auto">
      <div className="my-auto hidden w-1/2 md:block">
        <SearchResultsTrack songData={songData} isLoading={isSongDataLoading} />
      </div>

      <table className="my-auto table h-[80%] w-full border-separate border-spacing-y-4 sm:border-spacing-y-6 md:w-1/2">
        <thead>
          <tr>
            <td className="w-20 text-base font-bold normal-case opacity-0 sm:w-[70px]">Logo</td>
            <td className="w-28 text-base font-bold sm:w-24">Quality</td>
            <td className="w-20 text-base font-bold">Price</td>
            <td className="w-36 text-base font-bold">Artist's share</td>
            <td className="w-8 text-base font-bold opacity-0 sm:w-10">Link</td>
          </tr>
        </thead>
        <tbody>
          {/* <SearchResultsRow
            store="Bandcamp"
            vendorData={bandcampData}
            region={region}
            isLoading={isBandcampDataLoading}
          />
          <SearchResultsRow
            store="Beatport"
            vendorData={beatportData}
            region={region}
            isLoading={isBeatportDataLoading}
          /> */}

          <VendorResults
            store="bandcamp"
            region={region}
            vendorData={iTunesData}
            isLoading={isItunesDataLoading}
          />
          <VendorResults
            store="beatport"
            region={region}
            vendorData={iTunesData}
            isLoading={isItunesDataLoading}
          />
          <VendorResults
            store="iTunes"
            region={region}
            vendorData={iTunesData}
            isLoading={isItunesDataLoading}
          />
          <VendorResults
            store="amazon"
            region={region}
            vendorData={iTunesData}
            isLoading={isItunesDataLoading}
          />

          {/* <SearchResultsRow
            store="Amazon"
            region={region}
            vendorData={amazonMusicData}
            isLoading={isAmazonMusicDataLoading}
          /> */}
        </tbody>
      </table>
    </div>
  );
};

export default SearchResultsFrame;
