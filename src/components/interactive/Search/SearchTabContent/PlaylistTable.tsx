import { api } from "@/lib/api";
import { fadeInAndOut } from "@/styles/animations";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableBody from "./TableBody";
import TableRow from "./TableRow";

const PlaylistTable = () => {
  const [inputValue, setInputValue] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");

  const { data, isFetching } = api.playlist.getTracks.useQuery(
    { url: submittedUrl },
    { enabled: !!submittedUrl, staleTime: 5 * 60 * 1000, retry: false },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) setSubmittedUrl(inputValue.trim());
  };

  const hasError = data && "error" in data;
  const tracks = data && "tracks" in data ? data.tracks : null;

  return (
    <div className="flex h-full w-full flex-col">
      {/* URL input */}
      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-b border-foreground/10 px-4 py-3 sm:px-6"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="https://open.spotify.com/playlist/3TxNViSYOIVuZLEe9ZIbyx?si=8974367fcb0f488a"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isFetching}
          className="shrink-0 rounded-full border border-primary/40 px-3 py-1 text-xs uppercase tracking-wide text-primary transition-colors hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Load
        </button>
      </form>

      {/* Content */}
      <div className="relative flex-1 overflow-hidden">
        {isFetching && <SkeletonTable hasHeader={false} hasExtraElement={false} />}
        {!isFetching && (
          <AnimatePresence mode="wait">
            <motion.div
              key={submittedUrl || "empty"}
              {...fadeInAndOut(0.2)}
              className="h-full w-full"
            >
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
                <TableBody hasHeader={false}>
                  <>
                    {tracks.map((track, index) => (
                      <TableRow
                        key={`${index}-${track.song.spotifyId}`}
                        track={track}
                        showDuration={true}
                      />
                    ))}
                  </>
                </TableBody>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default PlaylistTable;
