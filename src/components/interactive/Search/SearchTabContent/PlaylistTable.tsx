import IconButton from "@/components/IconButton";
import WithTooltip from "@/components/WithTooltip";
import useFavorites from "@/hooks/useFavorites";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { api } from "@/lib/api";
import { fadeIn } from "@/styles/animations";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeftRightIcon, HeartIcon } from "lucide-react";
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
  const [isEditing, setIsEditing] = useState(true);
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

  const hasError = data && "error" in data;
  const tracks = data && "tracks" in data ? data.tracks : null;
  const meta = data && "meta" in data ? data.meta : null;

  useEffect(() => {
    if (tracks && !isFetching) setIsEditing(false);
  }, [tracks, isFetching]);

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

  const showLoadedHeader = !isEditing && !!tracks && !isFetching;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="shrink-0 border-b border-foreground/10">
        <AnimatePresence mode="wait" initial={false}>
          {showLoadedHeader ? (
            <motion.div
              key="loaded"
              {...fadeIn(0.15)}
              className="flex h-12 items-center gap-2 px-3 sm:px-5"
            >
              <div className="min-w-0 flex-1 truncate">
                {meta?.name ? (
                  <span className="text-base text-foreground/80">{meta.name}</span>
                ) : (
                  <span className="text-base text-foreground/30">
                    {tracks.length} track{tracks.length === 1 ? "" : "s"}
                  </span>
                )}
                {meta?.owner && (
                  <span className="text-base text-foreground/30"> · {meta.owner}</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-base text-foreground/30">
                  {tracks.length} track{tracks.length === 1 ? "" : "s"}
                </span>
                <button
                  type="button"
                  onClick={handleFavoriteAll}
                  disabled={isAddingAllToFavorites}
                  className="flex items-center gap-1.5 text-base text-primary transition hover:text-foreground disabled:opacity-40"
                >
                  <HeartIcon className="h-4 w-4" />
                  Save all
                </button>
                <WithTooltip tooltip="Edit playlist URL" touchToast="Edit playlist URL." asChild>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex h-8 w-8 items-center justify-center text-foreground/40 transition hover:text-foreground"
                  >
                    <ArrowLeftRightIcon className="h-4 w-4" />
                  </button>
                </WithTooltip>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="input"
              {...fadeIn(0.15)}
              onSubmit={handleSubmit}
              className="flex h-12 items-center gap-2 px-3 sm:px-5"
            >
              <input
                type="text"
                data-testid="playlist-url-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="https://open.spotify.com/playlist/..."
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground/80 outline-none placeholder:text-muted-foreground/80"
              />
              <IconButton
                disabled={!inputValue.trim() || isFetching}
                variant="primary"
                text="Load playlist"
                type="submit"
                size="xs"
                textStyle="uppercase text-xs"
                className="w-auto shrink-0"
              />
              {!!tracks && (
                <WithTooltip
                  tooltip="Back to playlist info"
                  touchToast="Back to playlist info."
                  asChild
                >
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex h-8 w-8 items-center justify-center text-foreground/40 transition hover:text-foreground"
                  >
                    <ArrowLeftRightIcon className="h-4 w-4" />
                  </button>
                </WithTooltip>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>

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
                <div className="hide-scrollbars relative h-full w-full overflow-scroll overflow-x-hidden px-3 pb-4 pt-2 sm:px-5 md:px-7">
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
    </div>
  );
};

export default PlaylistTable;
