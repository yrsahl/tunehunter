import { LoadingIndicator } from "@/components/Indicators";
import { useQueryDataContext } from "@/contexts/QueryDataContext";
import useDb from "@/hooks/useDb";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import useDeviceSize from "@/hooks/useDeviceSize";
import useSearch from "@/hooks/useSearch";
import useSpotifyTokens from "@/hooks/useSpotifyTokens";
import { api } from "@/lib/api";
import { fetchSpotifySearchData } from "@/services/spotify/api";
import { fadeInAndOut } from "@/styles/animations";
import { SpotifyTrack } from "@/types/song-types";
import { SpotifyTrack as ApiSpotifyTrack } from "@/types/spotify-types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import NoDataMessage from "./SearchTabContent/NoDataMessage";

const toSpotifyTrack = (item: ApiSpotifyTrack): SpotifyTrack => ({
  song: {
    title: item.name,
    duration: item.duration_ms,
    album: item.album.name ?? null,
    albumArtUrl: item.album.images[0]?.url ?? null,
    year: item.album.release_date,
    genre: null,
    spotifyId: item.id,
    previewUrl: item.preview_url ?? null,
    isrc: item.external_ids?.isrc ?? null,
  },
  artists: item.artists.map((a) => ({ id: a.id, name: a.name, popularity: null, followers: null })),
});

const SearchQueries = () => {
  const { isQueryDataLoading, queryData, lastQuery, setShowQueries } = useQueryDataContext();
  const { region } = useRegionSettings();
  const { submitSearch } = useSearch();
  const { storeTracksInDb } = useDb();
  const { isSmallDevice } = useDeviceSize();
  const { accessToken, userAccessToken } = useSpotifyTokens();
  const { mutateAsync: storeSpotifyTrack } = api.song.storeSpotifyTrack.useMutation();

  const [spotifyResults, setSpotifyResults] = useState<SpotifyTrack[] | null>(null);
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false);

  // Reset Spotify fallback whenever a new iTunes search runs
  useEffect(() => {
    setSpotifyResults(null);
  }, [queryData]);

  const handleSpotifyFallback = async () => {
    if (!lastQuery || !accessToken) return;
    setIsSpotifyLoading(true);
    try {
      const data = await fetchSpotifySearchData(accessToken, lastQuery);
      const items = data?.tracks?.items ?? [];
      setSpotifyResults(items.map(toSpotifyTrack));
    } finally {
      setIsSpotifyLoading(false);
    }
  };

  const handleSpotifyTrackClick = async (track: SpotifyTrack) => {
    if (!track.song.spotifyId) return;
    setShowQueries(false);
    try {
      await storeSpotifyTrack({
        track: {
          spotifyId: track.song.spotifyId,
          title: track.song.title,
          duration: track.song.duration,
          album: track.song.album ?? null,
          albumArtUrl: track.song.albumArtUrl ?? null,
          year: track.song.year,
          previewUrl: track.song.previewUrl ?? null,
          isrc: track.song.isrc ?? null,
        },
        artists: track.artists.map((a) => ({ spotifyId: a.id, name: a.name })),
        accessToken: userAccessToken ?? undefined,
      });
    } catch {
      return;
    }
    submitSearch(
      {
        song: { ...track.song, id: `sp_${track.song.spotifyId}` },
        artists: track.artists.map((a) => ({ ...a, id: `sp_${a.id}` })),
      },
      region,
    );
  };

  if (!queryData && !isQueryDataLoading) return <></>;

  const queryDataExists = queryData?.tracks?.items && queryData.tracks.items.length > 0;

  const footerButton = (
    <div className="flex flex-shrink-0 items-center justify-center border-t border-primary/30 py-2">
      {isSpotifyLoading ? (
        <LoadingIndicator size={20} />
      ) : spotifyResults ? (
        <span className="text-xs text-muted-foreground">Showing results from Spotify</span>
      ) : (
        <button
          onClick={handleSpotifyFallback}
          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Not finding what you&apos;re looking for?
        </button>
      )}
    </div>
  );

  type RowData = {
    song: { albumArtUrl?: string | null; title: string; duration: number };
    artists: { name: string }[];
  };

  const renderRow = (track: RowData, key: string, onClick: () => void) => {
    const primaryArtist = track.artists[0]?.name ?? "";
    return (
      <motion.tr
        key={key}
        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.2)", transition: { duration: 0.1 } }}
        className="cursor-pointer"
        onClick={onClick}
      >
        <td className="py-2 pl-3 pr-6 md:py-3 md:pl-5 md:pr-6">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="mask mask-squircle h-11 w-11">
                <img src={track.song.albumArtUrl ?? ""} />
              </div>
            </div>
          </div>
        </td>
        <td className="overflow-hidden pr-2 align-middle md:pr-4">
          <p>{primaryArtist}</p>
          {track.artists[1] && (
            <p className="overflow-ellipsis whitespace-nowrap text-muted-foreground">
              {track.artists[1].name}
            </p>
          )}
        </td>
        <td className="pr-4 align-middle">
          <span className="text-sm md:text-base">{track.song.title}</span>
        </td>
        <td className="pr-3 text-right align-middle text-xs opacity-50 md:pr-5 md:text-sm">
          {new Date(track.song.duration).toISOString().substr(14, 5)}
        </td>
      </motion.tr>
    );
  };

  return (
    <motion.div
      data-testid="search-results"
      {...fadeInAndOut()}
      className="absolute z-50 flex h-60 w-full flex-col rounded-b-lg border border-t-[1px] border-primary bg-background/30 text-sm backdrop-blur-md md:text-base"
    >
      <div className="hide-scrollbars flex-1 overflow-scroll">
        {isQueryDataLoading ? (
          <NoDataMessage element={<LoadingIndicator size={isSmallDevice ? 40 : 60} />} />
        ) : spotifyResults ? (
          spotifyResults.length === 0 ? (
            <NoDataMessage message="No results on Spotify either." />
          ) : (
            <table className="w-full">
              <motion.tbody {...fadeInAndOut(0.5)}>
                {spotifyResults.map((track) =>
                  renderRow(track, track.song.spotifyId ?? track.song.title, () => {
                    void handleSpotifyTrackClick(track);
                  }),
                )}
              </motion.tbody>
            </table>
          )
        ) : (
          <>
            {!queryDataExists && <NoDataMessage message="No results." />}
            {queryDataExists && (
              <table className="w-full">
                <motion.tbody {...fadeInAndOut(0.5)} key={queryData.tracks?.href}>
                  {queryData.tracks?.items.map((track) =>
                    renderRow(track, track.song.id, async () => {
                      setShowQueries(false);
                      const ok = await storeTracksInDb([track]);
                      if (ok) submitSearch(track, region);
                    }),
                  )}
                </motion.tbody>
              </table>
            )}
          </>
        )}
      </div>
      {!isQueryDataLoading && footerButton}
    </motion.div>
  );
};

export default SearchQueries;
