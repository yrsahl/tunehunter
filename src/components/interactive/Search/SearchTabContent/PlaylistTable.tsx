import IconButton from "@/components/IconButton";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { api } from "@/lib/api";
import { fadeIn } from "@/styles/animations";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableRow from "./TableRow";

const PlaylistTable = () => {
  const router = useRouterWithHelpers();
  const [inputValue, setInputValue] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");

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
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="https://open.spotify.com/playlist/3TxNViSYOIVuZLEe9ZIbyx?si=8974367fcb0f488a"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground/80 outline-none placeholder:text-muted-foreground/50"
        />
        <div className="min-w-0">
          <IconButton
            disabled={!inputValue.trim() || isFetching}
            variant="primary"
            text="Load"
            type="submit"
            size="xs"
            textStyle="uppercase text-xs"
          />
        </div>
      </form>

      <div className="relative flex-1 overflow-hidden">
        {isFetching ? (
          <motion.div key="skeleton" {...fadeIn(0.3)} className="h-full w-full">
            <SkeletonTable hasHeader={false} />
          </motion.div>
        ) : (
          <motion.div key={submittedUrl || "empty"} {...fadeIn(0.3)} className="h-full w-full">
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
      </div>
    </div>
  );
};

export default PlaylistTable;
