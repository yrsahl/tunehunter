import { api } from "@/utils/api";
import SearchResultsRow from "./SearchResultsRow";
import SearchResultsRowSkeleton from "./SearchResultsRowSkeleton";
import SearchResultsTrack from "./SearchResultsTrack";
import SearchResultsTrackSkeleton from "./SearchResultsTrackSkeleton";

interface ISearchResultsProps {
  songId: string;
}

const SearchResultsFrame = ({ songId }: ISearchResultsProps) => {
  // 1. Fetch song data
  const { data: songData, isLoading: isSongDataLoading } = api.song.getSongById.useQuery({
    id: songId,
  });
  // 2. Fetch vendor data
  const { data: amazonMusicData, isLoading: isAmazonMusicDataLoading } =
    api.externalVendor.getAmazonData.useQuery({ id: songId }, { refetchOnWindowFocus: false });
  const { data: appleMusicData, isLoading: isAppleMusicDataLoading } =
    api.externalVendor.getItunesData.useQuery({ id: songId }, { refetchOnWindowFocus: false });
  const { data: bandcampData, isLoading: isBandcampDataLoading } =
    api.externalVendor.getBandcampData.useQuery({ id: songId }, { refetchOnWindowFocus: false });
  const { data: beatportData, isLoading: isBeatportDataLoading } =
    api.externalVendor.getBeatportData.useQuery({ id: songId }, { refetchOnWindowFocus: false });

  return (
    <div className="flex h-96 w-11/12 flex-row gap-8 overflow-hidden overflow-x-auto">
      {isSongDataLoading && <SearchResultsTrackSkeleton />}
      {!isSongDataLoading && <SearchResultsTrack songData={songData} />}
      <table className="table w-full">
        <thead>
          <tr>
            <td className="text-base normal-case"></td>
            <td className="text-base normal-case">Quality</td>
            <td className="text-base normal-case">Artist's Share</td>
            <td className="text-base normal-case">Price</td>
          </tr>
        </thead>
        <tbody>
          {isAmazonMusicDataLoading && <SearchResultsRowSkeleton />}
          {!isAmazonMusicDataLoading && <SearchResultsRow data={amazonMusicData} />}
          {isAppleMusicDataLoading && <SearchResultsRowSkeleton />}
          {!isAppleMusicDataLoading && <SearchResultsRow data={appleMusicData} />}
          {isBandcampDataLoading && <SearchResultsRowSkeleton />}
          {!isBandcampDataLoading && <SearchResultsRow data={bandcampData} />}
          {isBeatportDataLoading && <SearchResultsRowSkeleton />}
          {!isBeatportDataLoading && <SearchResultsRow data={beatportData} />}
        </tbody>
      </table>
    </div>
  );
};

export default SearchResultsFrame;
