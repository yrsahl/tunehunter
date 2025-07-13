import { CountryCode } from "@/helpers/region";
import useSpotifyTokens from "@/hooks/useSpotifyTokens";
import { AppRouter } from "@/server/api/root";
import { api } from "@/utils/api";
import { inferProcedureOutput } from "@trpc/server";
import { createContext, useContext } from "react";

interface ISearchDataContext {
  songData: inferProcedureOutput<AppRouter["song"]["getSongAndArtistsBySongId"]> | null | undefined;
  isSongDataLoading: boolean;
  iTunesData: any;
  isItunesDataLoading: boolean;
  amazonMusicData: any;
  isAmazonMusicDataLoading: boolean;
  bandcampData: any;
  isBandcampDataLoading: boolean;
  beatportData: any;
  isBeatportDataLoading: boolean;
}

const SearchDataContext = createContext<ISearchDataContext>({
  songData: null,
  isSongDataLoading: true,
  iTunesData: null,
  isItunesDataLoading: true,
  amazonMusicData: null,
  isAmazonMusicDataLoading: true,
  bandcampData: null,
  isBandcampDataLoading: true,
  beatportData: null,
  isBeatportDataLoading: true,
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

  // 1. Get songData
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
  const isSongDataValid =
    !!songData &&
    !isSongDataLoading &&
    !!songData.title &&
    !!songData.album &&
    !!songData.duration &&
    !!songData.artists &&
    artists.length > 0;

  // iTunes
  const { data: iTunesData, isLoading: isItunesDataLoading } =
    api.songListings.getSongListing.useQuery(
      isSongDataValid
        ? {
            vendor: "itunes",
            region,
            songId,
            artist: artists,
            album: songData.album,
            duration: songData.duration,
            title: songData.title,
          }
        : undefined,
      {
        refetchOnWindowFocus: false,
        enabled: isSongDataValid,
      },
    );

  // // Beatport
  const { data: beatportData, isLoading: isBeatportDataLoading } =
    api.songListings.getSongListing.useQuery(
      isSongDataValid
        ? {
            vendor: "beatport",
            region,
            songId,
            artist: artists,
            album: songData.album,
            duration: songData.duration,
            title: songData.title,
          }
        : undefined,
      {
        refetchOnWindowFocus: false,
        enabled: isSongDataValid,
      },
    );

  // Amazon
  const { data: amazonMusicData, isLoading: isAmazonMusicDataLoading } =
    api.songListings.getSongListing.useQuery(
      isSongDataValid
        ? {
            vendor: "amazon",
            region,
            songId,
            artist: artists,
            album: songData.album,
            duration: songData.duration,
            title: songData.title,
          }
        : undefined,
      {
        refetchOnWindowFocus: false,
        enabled: isSongDataValid,
      },
    );

  // Bandcamp
  const { data: bandcampData, isLoading: isBandcampDataLoading } =
    api.songListings.getSongListing.useQuery(
      isSongDataValid
        ? {
            vendor: "bandcamp",
            region,
            songId,
            artist: artists,
            album: songData.album,
            duration: songData.duration,
            title: songData.title,
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
        amazonMusicData,
        isAmazonMusicDataLoading,
        bandcampData,
        isBandcampDataLoading,
        beatportData,
        isBeatportDataLoading,
      }}
    >
      {children}
    </SearchDataContext.Provider>
  );
};
