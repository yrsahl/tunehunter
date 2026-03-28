import IconButton from "@/components/IconButton";
import useFavorites from "@/hooks/useFavorites";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { api } from "@/lib/api";
import { fadeIn, slideInFromBottom } from "@/styles/animations";
import { AnimatePresence, motion } from "framer-motion";
import { HeartIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableRow from "./TableRow";

const PlaylistTable = () => {
  const router = useRouterWithHelpers();
  const [inputValue, setInputValue] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");
  const { status } = useSession();
  const { addAllToFavorites, isAddingAllToFavorites } = useFavorites();

  useEffect(() => {
    if (!router.isReady) return;
    const urlParam = router.getParams("playlist");
    if (urlParam) {
      setInputValue(urlParam);
      setSubmittedUrl(urlParam);
    }
  }, [router.isReady]);

  const { data, isFetching } = api.playlist.getTracks.useQuery(
    { url: submittedUrl },
    { enabled: !!submittedUrl, staleTime: 5 * 60 * 1000, retry: false },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = inputValue.trim();
    if (url) {
      setSubmittedUrl(url);
      router.setParams({ playlist: url });
    }
  };

  const handleFavoriteAll = async () => {
    if (status !== "authenticated") {
      toast("Sign in to save songs to your favorites", {
        action: { label: "Sign in", onClick: () => router.setParams({ profile: "login" }) },
      });
      return;
    }
    if (!tracks) return;
    const result = await addAllToFavorites(tracks);
    if (result.added === 0) {
      toast.info("All songs are already in your favorites.");
    } else {
      toast.success(`${result.added} song${result.added === 1 ? "" : "s"} added to favorites.`);
    }
  };

  const hasError = data && "error" in data;
  const tracks = data && "tracks" in data ? data.tracks : null;

  return (
    <div className="flex h-full w-full flex-col">
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-b border-foreground/10 px-3 py-2 sm:px-5"
      >
        <input
          type="text"
          data-testid="playlist-url-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="https://open.spotify.com/playlist/..."
          className="min-w-0 flex-1 bg-transparent text-base text-foreground/80 outline-none placeholder:text-muted-foreground/80"
        />
        <IconButton
          disabled={!inputValue.trim() || isFetching}
          variant="primary"
          text="Load"
          type="submit"
          size="xs"
          textStyle="uppercase text-xs"
          className="w-auto shrink-0"
        />
      </form>

      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {isFetching ? (
            <motion.div key="skeleton" {...fadeIn(0.2)} className="h-full w-full">
              <SkeletonTable hasHeader={false} />
            </motion.div>
          ) : (
            <motion.div key={submittedUrl || "empty"} {...fadeIn(0.2)} className="h-full w-full">
              {!submittedUrl && (
                <NoDataMessage message="Paste a public Spotify playlist link above to browse its tracks." />
              )}
              {submittedUrl && hasError && (
                <NoDataMessage
                  message={"error" in data && data.error ? data.error : "Something went wrong."}
                />
              )}
              {submittedUrl && tracks && tracks.length === 0 && (
                <NoDataMessage message="This playlist is empty." />
              )}
              {submittedUrl && tracks && tracks.length > 0 && (
                <div className="hide-scrollbars relative h-full w-full overflow-scroll overflow-x-hidden px-3 pb-4 pt-2 sm:px-5 sm:pt-4 md:px-7">
                  <table className="w-full table-fixed">
                    <tbody>
                      {tracks.map((track, index) => (
                        <TableRow
                          key={`${index}-${track.song.spotifyId}`}
                          track={track}
                          showDuration
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {tracks && tracks.length > 0 && !isFetching && (
          <motion.div
            key="save-all-footer"
            {...slideInFromBottom(0.25)}
            className="flex shrink-0 items-center justify-between border-t border-foreground/10 px-3 py-2 sm:px-5"
          >
            <span className="text-xs text-foreground/30">
              {tracks.length} track{tracks.length === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={handleFavoriteAll}
              disabled={isAddingAllToFavorites}
              className="flex items-center gap-1.5 text-xs text-foreground/50 transition hover:text-foreground/80 disabled:opacity-40"
            >
              <HeartIcon className="h-3.5 w-3.5" />
              Save all to favorites
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaylistTable;
