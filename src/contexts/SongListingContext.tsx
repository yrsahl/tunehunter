import EnrichmentDebugPanel from "@/components/dev/EnrichmentDebugPanel";
import useSearchStore, {
  SEARCH_SUBMITTED,
  SelectedSearchParams,
} from "@/hooks/stores/useSearchStore";
import { useEventEmitter } from "@/hooks/useEventEmitter";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import useSpotifyTokens from "@/hooks/useSpotifyTokens";
import { api } from "@/lib/api";
import { CountryCode } from "@/lib/validators";
import { AppRouter } from "@/server/api/root";
import { SongVendorType } from "@/server/db/schema";
import { Track } from "@/types/song-types";
import { inferProcedureOutput } from "@trpc/server";
import { keepPreviousData } from "@tanstack/react-query";
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
  const { accessToken } = useSpotifyTokens();
  const { setSelectedSearch } = useSearchStore();
  const router = useRouterWithHelpers();
  const { publishEvent } = useEventEmitter<SelectedSearchParams | null>(SEARCH_SUBMITTED);
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
  const { mutate: enrichItunesTrackFromSpotify, status: flowAStatus } =
    api.song.enrichItunesTrackFromSpotify.useMutation({
      onSuccess: () => utils.song.getTrack.invalidate({ id: songId }),
    });

  useEffect(() => {
    if (accessToken && trackData && !songId.startsWith("sp_")) {
      enrichItunesTrackFromSpotify({ songId, accessToken });
    }
  }, [songId, accessToken, !!trackData]);

  // Merge sp_ songs into their iTunes counterpart: finds the iTunes match, migrates all FK
  // relations, deletes the sp_ record, then navigates to the new iTunes ID.
  const enrichedSpIdRef = useRef<string | null>(null);
  const mergedItunesIdRef = useRef<string | null>(null);
  const {
    mutate: enrichSpotifySongFromItunes,
    status: flowBStatus,
    error: flowBError,
  } = api.song.enrichSpotifySongFromItunes.useMutation({
    onError: () => {
      // Reset guard so the next render can retry (e.g. transient network error)
      enrichedSpIdRef.current = null;
    },
    onSuccess: (result) => {
      // If the mutation returned without an itunesId (server hit an early return),
      // reset the guard so the effect can retry when itunesResponse next changes.
      if (!result?.itunesId) {
        enrichedSpIdRef.current = null;
        return;
      }
      // Pre-populate the getTrack cache for the iTunes ID before navigating so that
      // SongListings never sees track=null during the transition (which would unmount
      // the entire provider and flash all listings back to loading state).
      if (trackData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        utils.song.getTrack.setData({ id: result.itunesId }, {
          ...trackData,
          song: { ...trackData.song, id: result.itunesId },
        } as any);
      }
      mergedItunesIdRef.current = result.itunesId;
      const mergedSearch = {
        id: result.itunesId,
        region,
        artist: track.artists[0]?.name ?? "",
        title: track.song.title,
      };
      setSelectedSearch(mergedSearch);
      publishEvent(mergedSearch, false);
      void router.setParams({ id: result.itunesId });
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

  // iTunes
  const {
    data: itunesResponse,
    isLoading: isItunesResponseLoading,
    isFetching: isItunesFetching,
    isPlaceholderData: isItunesPlaceholder,
  } = api.songListings.getSongListing.useQuery(
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
      placeholderData: keepPreviousData,
    },
  );

  // Trigger merge when the iTunes listing returns a match for an sp_ song.
  // The listing URL contains the iTunes trackId (?i=TRACKID), so we pass it directly —
  // no second iTunes search needed, and the correct regional store is already used.
  useEffect(() => {
    if (!songId.startsWith("sp_")) return;
    if (!itunesResponse || !("data" in itunesResponse) || !itunesResponse.data) return;
    if (isItunesPlaceholder) return;
    if (enrichedSpIdRef.current === songId) return;

    let itunesId: string | undefined;
    try {
      itunesId = new URL(itunesResponse.data.url).searchParams.get("i") ?? undefined;
    } catch {
      return;
    }
    if (!itunesId) return;

    enrichedSpIdRef.current = songId;
    enrichSpotifySongFromItunes({ songId, itunesId });
  }, [itunesResponse, songId, isItunesPlaceholder]);

  // Beatport
  const {
    data: beatportResponse,
    isLoading: isBeatportResponseLoading,
    isFetching: isBeatportFetching,
    isPlaceholderData: isBeatportPlaceholder,
  } = api.songListings.getSongListing.useQuery(
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
      placeholderData: keepPreviousData,
    },
  );

  // Amazon
  const {
    data: amazonResponse,
    isLoading: isAmazonResponseLoading,
    isFetching: isAmazonFetching,
    isPlaceholderData: isAmazonPlaceholder,
  } = api.songListings.getSongListing.useQuery(
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
      placeholderData: keepPreviousData,
    },
  );

  // Bandcamp
  const {
    data: bandcampResponse,
    isLoading: isBandcampResponseLoading,
    isFetching: isBandcampFetching,
    isPlaceholderData: isBandcampPlaceholder,
  } = api.songListings.getSongListing.useQuery(
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
      placeholderData: keepPreviousData,
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
          return isItunesResponseLoading || isItunesPlaceholder;
        case "beatport":
          return isBeatportResponseLoading || isBeatportPlaceholder;
        case "amazon":
          return isAmazonResponseLoading || isAmazonPlaceholder;
        case "bandcamp":
          return isBandcampResponseLoading || isBandcampPlaceholder;
        default:
          return true;
      }
    },
    [
      isItunesResponseLoading, isItunesPlaceholder,
      isBeatportResponseLoading, isBeatportPlaceholder,
      isAmazonResponseLoading, isAmazonPlaceholder,
      isBandcampResponseLoading, isBandcampPlaceholder,
    ],
  );

  const isTrackDataLoading = fetchedTrackData?.song.id !== songId;

  const contextValue = useMemo(
    () => ({
      trackData,
      isTrackDataLoading,
      getVendorResponse,
      getVendorResponseLoadingState,
    }),
    [trackData, getVendorResponse, getVendorResponseLoadingState],
  );

  return (
    <SongListingContext.Provider value={contextValue}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <EnrichmentDebugPanel
          songId={songId}
          trackData={trackData}
          isSongDataValid={isSongDataValid}
          flowAStatus={flowAStatus}
          flowBStatus={flowBStatus}
          flowBError={flowBError?.message ?? null}
          mergedItunesId={mergedItunesIdRef.current}
          vendors={[
            {
              name: "iTunes",
              isLoading: isItunesResponseLoading,
              isFetching: isItunesFetching,
              isPlaceholderData: isItunesPlaceholder,
              data: itunesResponse,
            },
            {
              name: "Beatport",
              isLoading: isBeatportResponseLoading,
              isFetching: isBeatportFetching,
              isPlaceholderData: isBeatportPlaceholder,
              data: beatportResponse,
            },
            {
              name: "Amazon",
              isLoading: isAmazonResponseLoading,
              isFetching: isAmazonFetching,
              isPlaceholderData: isAmazonPlaceholder,
              data: amazonResponse,
            },
            {
              name: "Bandcamp",
              isLoading: isBandcampResponseLoading,
              isFetching: isBandcampFetching,
              isPlaceholderData: isBandcampPlaceholder,
              data: bandcampResponse,
            },
          ]}
        />
      )}
    </SongListingContext.Provider>
  );
};
