import { CountryCode } from "@/helpers/region";
import { api } from "@/utils/api";
import { useMemo } from "react";
import SearchResultsTrack from "./SearchResultsTrack";
import VendorResults from "./VendorResults";

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
  const artists = songData?.artists.map((artist) => artist.name).join(", ") || "";

  // Compute a flag to ensure all required fields are present
  const isSongDataValid = useMemo(() => {
    return (
      songData !== null &&
      songData &&
      !!songData.artists &&
      !!songData.title &&
      !!songData.album &&
      !!songData.duration
    );
  }, [songData]);

  // 2. Fetch vendor data
  // const { data: amazonMusicData, isLoading: isAmazonMusicDataLoading } =
  //   api.externalVendor.getAmazonData.useQuery(
  //     isSongDataValid
  //       ? {
  //           id: songId,
  //           region,
  //           artist: artists,
  //           title: songData!.title,
  //           album: songData!.album,
  //           duration: songData!.duration,
  //         }
  //       : undefined,
  //     {
  //       refetchOnWindowFocus: false,
  //       enabled: isSongDataValid,
  //     },
  //   );

  const { data: itunesData, isLoading: isItunesDataLoading } =
    api.externalVendor.getItunesData.useQuery(
      isSongDataValid
        ? {
            id: songId,
            region,
            artist: artists,
            title: songData!.title,
            album: songData!.album,
            duration: songData!.duration,
          }
        : undefined,
      {
        refetchOnWindowFocus: false,
        enabled: isSongDataValid,
      },
    );

  // const { data: bandcampData, isLoading: isBandcampDataLoading } =
  //   api.externalVendor.getBandcampData.useQuery(
  //     isSongDataValid
  //       ? {
  //           id: songId,
  //           region,
  //           artist: artists,
  //           title: songData!.title,
  //           album: songData!.album,
  //           duration: songData!.duration,
  //         }
  //       : undefined,
  //     {
  //       refetchOnWindowFocus: false,
  //       enabled: isSongDataValid,
  //     },
  //   );

  // const { data: beatportData, isLoading: isBeatportDataLoading } =
  //   api.externalVendor.getBeatportData.useQuery(
  //     isSongDataValid
  //       ? {
  //           id: songId,
  //           region,
  //           artist: artists,
  //           title: songData!.title,
  //           album: songData!.album,
  //           duration: songData!.duration,
  //         }
  //       : undefined,
  //     {
  //       refetchOnWindowFocus: false,
  //       enabled: isSongDataValid,
  //     },
  //   );

  return (
    <div className="hide-scrollbars flex h-96 flex-row gap-8 overflow-hidden overflow-x-auto">
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
            store="iTunes"
            region={region}
            vendorData={itunesData}
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
