import { CountryCode } from "@/helpers/region";
import { api } from "@/utils/api";
import SearchResultsRow from "./SearchResultsRow";
import SearchResultsTrack from "./SearchResultsTrack";

interface ISearchResultsProps {
  songId: string;
  region: CountryCode;
}

const SearchResultsFrame = ({ songId, region }: ISearchResultsProps) => {
  // 1. Fetch song data
  const { data: songData, isLoading: isSongDataLoading } =
    api.song.getSongAndArtistsBySongId.useQuery({
      id: songId,
    });
  // 2. Fetch vendor data
  const { data: amazonMusicData, isLoading: isAmazonMusicDataLoading } =
    api.externalVendor.getAmazonData.useQuery(
      { id: songId, region },
      { refetchOnWindowFocus: false },
    );
  const { data: itunesData, isLoading: isItunesDataLoading } =
    api.externalVendor.getItunesData.useQuery(
      { id: songId, region },
      { refetchOnWindowFocus: false },
    );
  const { data: bandcampData, isLoading: isBandcampDataLoading } =
    api.externalVendor.getBandcampData.useQuery(
      { id: songId, region },
      { refetchOnWindowFocus: false },
    );
  const { data: beatportData, isLoading: isBeatportDataLoading } =
    api.externalVendor.getBeatportData.useQuery(
      { id: songId, region },
      { refetchOnWindowFocus: false },
    );

  return (
    <div className="flex h-96 flex-row gap-8 overflow-hidden overflow-x-auto">
      <div className="my-auto hidden w-1/2 md:block">
        <SearchResultsTrack songData={songData} isLoading={isSongDataLoading} />
      </div>
      <table className="my-auto table h-[80%] w-full border-separate border-spacing-y-6 md:w-1/2">
        <thead>
          <tr>
            <td className="w-[70px] text-base font-bold normal-case opacity-0">Logo</td>
            <td className="w-24 text-base font-bold">Quality</td>
            <td className="w-20 text-base font-bold">Price</td>
            <td className="w-36 text-base font-bold">Artist's share</td>
            <td className="w-10 text-base font-bold">Link</td>
          </tr>
        </thead>
        <tbody>
          <SearchResultsRow
            store="Amazon"
            region={region}
            data={amazonMusicData}
            isLoading={isAmazonMusicDataLoading}
          />
          <SearchResultsRow
            store="iTunes"
            region={region}
            data={itunesData}
            isLoading={isItunesDataLoading}
          />
          <SearchResultsRow
            store="Bandcamp"
            data={bandcampData}
            region={region}
            isLoading={isBandcampDataLoading}
          />
          <SearchResultsRow
            store="Beatport"
            data={beatportData}
            region={region}
            isLoading={isBeatportDataLoading}
          />
        </tbody>
      </table>
    </div>
  );
};

export default SearchResultsFrame;
