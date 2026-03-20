import useSpotifyTokens from "@/hooks/useSpotifyTokens";
import { api } from "@/lib/api";
import { CountryCode } from "@/lib/validators";
import { AppRouter } from "@/server/api/root";
import { SongVendorType } from "@/server/db/schema";
import { inferProcedureOutput } from "@trpc/server";
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";

interface ISongListingContext {
  trackData: inferProcedureOutput<AppRouter["song"]["getTrack"]> | null | undefined;
  isTrackDataLoading: boolean;
  getVendorResponse: (
    vendor: SongVendorType,
  ) => inferProcedureOutput<AppRouter["songListings"]["getSongListing"]> | null | undefined;
  getVendorResponseLoadingState: (vendor: SongVendorType) => boolean;
}

const SongListingContext = createContext<ISongListingContext>({
  trackData: null,
  isTrackDataLoading: true,
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
  const { userAccessToken } = useSpotifyTokens();

  // 1. Get trackData
  const utils = api.useUtils();
  const { data: trackData, isLoading: isTrackDataLoading } = api.song.getTrack.useQuery({
    id: songId,
  });

  // 2. Enrich artist data (popularity, followers, genres) if logged in
  const { mutate: enrichArtists } = api.song.enrichArtists.useMutation({
    onSuccess: () => utils.song.getTrack.invalidate({ id: songId }),
  });

  useEffect(() => {
    if (userAccessToken && trackData) {
      enrichArtists({ songId, accessToken: userAccessToken });
    }
  }, [songId, userAccessToken, !!trackData]);

  const artists = useMemo(
    () => trackData?.artists.map((artist) => artist.name).join(", ") ?? "",
    [trackData?.artists],
  );

  const isSongDataValid = useMemo(() => {
    return (
      !isTrackDataLoading &&
      !!trackData &&
      !!trackData.song.title &&
      !!trackData.song.album &&
      !!trackData.song.duration &&
      artists.length > 0
    );
  }, [isTrackDataLoading, trackData, artists]);

  // iTunes
  const { data: itunesResponse, isLoading: isItunesResponseLoading } =
    api.songListings.getSongListing.useQuery(
      {
        vendor: "itunes",
        region,
        songId,
        artist: artists,
        album: trackData?.song.album || "",
        duration: trackData?.song.duration || 0,
        title: trackData?.song.title || "",
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
        album: trackData?.song.album || "",
        duration: trackData?.song.duration || 0,
        title: trackData?.song.title || "",
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
        album: trackData?.song.album || "",
        duration: trackData?.song.duration || 0,
        title: trackData?.song.title || "",
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
        album: trackData?.song.album || "",
        duration: trackData?.song.duration || 0,
        title: trackData?.song.title || "",
      },
      {
        refetchOnWindowFocus: false,
        enabled: isSongDataValid,
      },
    );

  const getVendorResponse = useCallback(
    (vendor: SongVendorType) => {
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
    },
    [itunesResponse, beatportResponse, amazonResponse, bandcampResponse],
  );

  const getVendorResponseLoadingState = useCallback(
    (vendor: SongVendorType) => {
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
    },
    [
      isItunesResponseLoading,
      isBeatportResponseLoading,
      isAmazonResponseLoading,
      isBandcampResponseLoading,
    ],
  );

  const contextValue = useMemo(
    () => ({ trackData, isTrackDataLoading, getVendorResponse, getVendorResponseLoadingState }),
    [trackData, isTrackDataLoading, getVendorResponse, getVendorResponseLoadingState],
  );

  return <SongListingContext.Provider value={contextValue}>{children}</SongListingContext.Provider>;
};
