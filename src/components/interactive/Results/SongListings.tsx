import { SongListingContextProvider } from "@/contexts/SongListingContext";
import useRegionSettings from "@/hooks/settings/useRegionSettings";
import useSearchStore, { SEARCH_SUBMITTED, SelectedSearchParams } from "@/hooks/stores/useSearchStore";
import { useEventEmitter } from "@/hooks/useEventEmitter";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { api } from "@/lib/api";
import { CountryCode } from "@/lib/validators";
import { slideInAndOutFromBottom } from "@/styles/animations";
import { Track } from "@/types/song-types";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import SongListingsContainer from "./SongListingsContainer";

const SongListings = () => {
  const { eventData } = useEventEmitter<SelectedSearchParams | null>(SEARCH_SUBMITTED);
  const { searchState } = useSearchStore();

  // eventData is undefined until an event arrives; null means explicitly cleared.
  // When undefined (lazy-loaded component missed the event), fall back to the store.
  const search: SelectedSearchParams | null | undefined = useMemo(() => {
    if (eventData !== undefined) return eventData;
    if (searchState.id && searchState.region && searchState.songArtist && searchState.songTitle) {
      return { id: searchState.id, region: searchState.region, artist: searchState.songArtist, title: searchState.songTitle };
    }
    return undefined;
  }, [eventData, searchState.id, searchState.region, searchState.songArtist, searchState.songTitle]);
  const { region } = useRegionSettings();
  const router = useRouterWithHelpers();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrolledForIdRef = useRef<string | undefined>(undefined);

  // For route restore: fetch track when it's not already in the event payload
  const { data: fetchedTrack } = api.song.getTrack.useQuery(
    { id: search?.id ?? "" },
    { enabled: !!search?.id && !search?.track, staleTime: 5 * 60 * 1000 },
  );
  const track: Track | null = (search?.track ?? fetchedTrack ?? null) as Track | null;

  // Scroll into view when a new search is submitted (not on region change remounts)
  useEffect(() => {
    if (!search?.id || search.id === scrolledForIdRef.current) return;
    if (containerRef.current) {
      scrolledForIdRef.current = search.id;
      containerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [search]);

  // Keep the URL region param in sync with the current region setting
  useEffect(() => {
    if (!router.isReady) return;
    if (router.getParams("region") !== region.toLowerCase()) {
      router.setParams({ region: region.toLowerCase() });
    }
  }, [region, !!search, router.isReady]);

  return (
    <AnimatePresence mode="wait">
      {search && track && (
        <SongListingContextProvider
          key={`${region}`}
          region={region as CountryCode}
          track={track}
        >
          <motion.div
            {...slideInAndOutFromBottom(0.5)}
            className="w-full rounded-3xl lg:-mt-2"
            ref={containerRef}
          >
            <SongListingsContainer region={region as CountryCode} />
          </motion.div>
        </SongListingContextProvider>
      )}
    </AnimatePresence>
  );
};

export default SongListings;
