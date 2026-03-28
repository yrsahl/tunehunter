import useSearchStore from "@/hooks/stores/useSearchStore";
import useSpotifyTokens from "@/hooks/useSpotifyTokens";
import { api } from "@/lib/api";
import { CountryCode } from "@/lib/validators";
import { AppRouter } from "@/server/api/root";
import { SongVendorType } from "@/server/db/schema";
import { Track } from "@/types/song-types";
import { inferProcedureOutput } from "@trpc/server";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";

interface ISongListingContext {
  trackData: Track | null | undefined;
  isTrackDataLoading: boolean;
  getVendorResponse: (
    vendor: SongVendorType,
  ) => inferProcedureOutput<AppRouter["songListings"]["getSongListing"]> | null | undefined;
  getVendorResponseLoadingState: (vendor: SongVendorType) => boolean;
}

const SongListingContext = createContext<ISongListingContext>({
  trackData: null,
  isTrackDataLoading: false,
  getVendorResponse: () => null,
  getVendorResponseLoadingState: () => true,
});

export const useSongListingContext = () => useContext(SongListingContext);

interface ISongListingContextProviderProps {
  track: Track;
  region: CountryCode;
  children: React.ReactNode;
}

export const SongListingContextProvider = ({
  track,
  region,
  children,
}: ISongListingContextProviderProps) => {
  const { userAccessToken } = useSpotifyTokens();
  const { setSelectedSearch } = useSearchStore();
  const songId = track.song.id;

  // Keep a query for background refresh after artist enrichment
  const utils = api.useUtils();
  const { data: fetchedTrackData } = api.song.getTrack.useQuery(
    { id: songId },
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      initialData: track as any,
      staleTime: 5 * 60 * 1000,
    },
  );

  // Always fall back to the passed track so trackData is never undefined mid-transition
  const trackData = fetchedTrackData ?? track;

  // Enrich iTunes-sourced songs with Spotify data (popularity, followers, genres)
  const { mutate: enrichItunesTrackFromSpotify } = api.song.enrichItunesTrackFromSpotify.useMutation({
    onSuccess: () => utils.song.getTrack.invalidate({ id: songId }),
  });

  useEffect(() => {
    if (userAccessToken && trackData && !songId.startsWith("sp_")) {
      enrichItunesTrackFromSpotify({ songId, accessToken: userAccessToken });
    }
  }, [songId, userAccessToken, !!trackData]);

  // Merge sp_ songs into their iTunes counterpart: finds the iTunes match, migrates all FK
  // relations, deletes the sp_ record, then navigates to the new iTunes ID.
  const enrichedSpIdRef = useRef<string | null>(null);
  const { mutate: enrichSpotifySongFromItunes } = api.song.enrichSpotifySongFromItunes.useMutation({
    onSuccess: (result) => {
      if (result?.itunesId) {
        setSelectedSearch({
          id: result.itunesId,
          region,
          artist: track.artists[0]?.name ?? "",
          title: track.song.title,
        });
      }
    },
  });

  const artists = useMemo(
    () => trackData?.artists.map((artist) => artist.name).join(", ") ?? "",
    [trackData?.artists],
  );

  const isSongDataValid = useMemo(() => {
    return (
      !!trackData &&
      !!trackData.song.title &&
      !!trackData.song.album &&
      !!trackData.song.duration &&
      artists.length > 0
    );
  }, [trackData, artists]);

  useEffect(() => {
    if (isSongDataValid && songId.startsWith("sp_") && enrichedSpIdRef.current !== songId) {
      enrichedSpIdRef.current = songId;
      enrichSpotifySongFromItunes({ songId });
    }
  }, [songId, isSongDataValid]);

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
    () => ({
      trackData,
      isTrackDataLoading: false,
      getVendorResponse,
      getVendorResponseLoadingState,
    }),
    [trackData, getVendorResponse, getVendorResponseLoadingState],
  );

  return <SongListingContext.Provider value={contextValue}>{children}</SongListingContext.Provider>;
};
