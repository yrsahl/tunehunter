import { CountryCode } from "@/helpers/region";
import useSpotifyTokens from "@/hooks/useSpotifyTokens";
import { AppRouter } from "@/server/api/root";
import { api } from "@/utils/api";
import { inferProcedureOutput } from "@trpc/server";
import { createContext, useContext, useMemo } from "react";

interface ISearchDataContext {
  songData: inferProcedureOutput<AppRouter["song"]["getSongAndArtistsBySongId"]> | null | undefined;
  isSongDataLoading: boolean;
  iTunesData: any;
  isItunesDataLoading: boolean;
  // amazonMusicData: any; // Uncomment if needed
  // isAmazonMusicDataLoading: boolean; // Uncomment if needed
  // bandcampData: any; // Uncomment if needed
  // isBandcampDataLoading: boolean; // Uncomment if needed
  // beatportData: any; // Uncomment if needed
  // isBeatportDataLoading: boolean; // Uncomment if needed
}

const SearchDataContext = createContext<ISearchDataContext>({
  songData: null,
  isSongDataLoading: true,
  iTunesData: null,
  isItunesDataLoading: true,
  // amazonMusicData: null, // Uncomment if needed
  // isAmazonMusicDataLoading: true, // Uncomment if needed
  // bandcampData: null, // Uncomment if needed
  // isBandcampDataLoading: true, // Uncomment if needed
  // beatportData: null, // Uncomment if needed
  // isBeatportDataLoading: true, // Uncomment if needed
});

export const useSearchDataContext = () => useContext(SearchDataContext);

interface ISearchDataContextProviderProps {
  songId: string;
  region: CountryCode;
  children: React.ReactNode;
}

export const SearchDataContextProvider = ({
  songId,
  region,
  children,
}: ISearchDataContextProviderProps) => {
  const { accessToken } = useSpotifyTokens();

  // Get songData
  const { data: songData, isLoading: isSongDataLoading } =
    api.song.getSongAndArtistsBySongId.useQuery(
      {
        id: songId,
        accessToken: accessToken || "",
      },
      {
        enabled: !!accessToken,
      },
    );

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
  const { data: iTunesData, isLoading: isItunesDataLoading } =
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

  return (
    <SearchDataContext.Provider
      value={{
        songData,
        isSongDataLoading,
        iTunesData,
        isItunesDataLoading,
        // amazonMusicData,
        // isAmazonMusicDataLoading,
        // bandcampData,
        // isBandcampDataLoading,
        // beatportData,
        // isBeatportDataLoading,
      }}
    >
      {children}
    </SearchDataContext.Provider>
  );
};

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
