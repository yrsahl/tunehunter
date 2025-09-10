import useSpotifyTokens from "@/hooks/useSpotifyTokens";
import { api } from "@/lib/api";
import { CountryCode } from "@/lib/validators";
import { AppRouter } from "@/server/api/root";
import { SongVendorType } from "@/server/db/schema";
import { inferProcedureOutput } from "@trpc/server";
import { createContext, useContext, useMemo } from "react";

interface ISongListingContext {
  songData: inferProcedureOutput<AppRouter["song"]["getSongAndArtistsBySongId"]> | null | undefined;
  isSongDataLoading: boolean;
  getVendorResponse: (
    vendor: SongVendorType,
  ) => inferProcedureOutput<AppRouter["songListings"]["getSongListing"]> | null | undefined;
  getVendorResponseLoadingState: (vendor: SongVendorType) => boolean;
}

const SongListingContext = createContext<ISongListingContext>({
  songData: null,
  isSongDataLoading: true,
  getVendorResponse: () => null,
  getVendorResponseLoadingState: () => true,
});

export const useSongListingContext = () => useContext(SongListingContext);

interface ISongListingContextProviderProps {
  songId: string;
  region: CountryCode;
  children: React.ReactNode;
}

export const SongListingContextProvider = ({
  songId,
  region,
  children,
}: ISongListingContextProviderProps) => {
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
  const isSongDataValid = useMemo(() => {
    return (
      !isSongDataLoading &&
      !!songData &&
      !!songData.title &&
      !!songData.album &&
      !!songData.duration &&
      !!songData.artists &&
      artists.length > 0
    );
  }, [isSongDataLoading, songData, artists]);

  // iTunes
  const { data: itunesResponse, isLoading: isItunesResponseLoading } =
    api.songListings.getSongListing.useQuery(
      {
        vendor: "itunes",
        region,
        songId,
        artist: artists,
        album: songData?.album || "",
        duration: songData?.duration || 0,
        title: songData?.title || "",
      },
      {
        refetchOnWindowFocus: false,
        enabled: isSongDataValid,
      },
    );

  // // Beatport
  const { data: beatportResponse, isLoading: isBeatportResponseLoading } =
    api.songListings.getSongListing.useQuery(
      {
        vendor: "beatport",
        region,
        songId,
        artist: artists,
        album: songData?.album || "",
        duration: songData?.duration || 0,
        title: songData?.title || "",
      },
      {
        refetchOnWindowFocus: false,
        enabled: isSongDataValid,
      },
    );

  // Amazon
  const { data: amazonResponse, isLoading: isAmazonResponseLoading } =
    api.songListings.getSongListing.useQuery(
      {
        vendor: "amazon",
        region,
        songId,
        artist: artists,
        album: songData?.album || "",
        duration: songData?.duration || 0,
        title: songData?.title || "",
      },
      {
        refetchOnWindowFocus: false,
        enabled: isSongDataValid,
      },
    );

  // Bandcamp
  const { data: bandcampResponse, isLoading: isBandcampResponseLoading } =
    api.songListings.getSongListing.useQuery(
      {
        vendor: "bandcamp",
        region,
        songId,
        artist: artists,
        album: songData?.album || "",
        duration: songData?.duration || 0,
        title: songData?.title || "",
      },
      {
        refetchOnWindowFocus: false,
        enabled: isSongDataValid,
      },
    );

  const getVendorResponse = (vendor: SongVendorType) => {
    switch (vendor) {
      case "itunes":
        return itunesResponse;
      case "beatport":
        return beatportResponse;
      case "amazon":
        return amazonResponse;
      case "bandcamp":
        return bandcampResponse;
      default:
        return null;
    }
  };

  const getVendorResponseLoadingState = (vendor: SongVendorType) => {
    switch (vendor) {
      case "itunes":
        return isItunesResponseLoading;
      case "beatport":
        return isBeatportResponseLoading;
      case "amazon":
        return isAmazonResponseLoading;
      case "bandcamp":
        return isBandcampResponseLoading;
      default:
        return true;
    }
  };

  return (
    <SongListingContext.Provider
      value={{
        songData,
        isSongDataLoading,
        getVendorResponse,
        getVendorResponseLoadingState,
      }}
    >
      {children}
    </SongListingContext.Provider>
  );
};
