import { Track } from "@/types/song-types";
import { useState } from "react";

type MutationStatus = "idle" | "loading" | "pending" | "success" | "error";

interface VendorState {
  name: string;
  isLoading: boolean;
  isFetching: boolean;
  isPlaceholderData: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

interface Props {
  songId: string;
  trackData: Track | null | undefined;
  isSongDataValid: boolean;
  flowAStatus: MutationStatus;
  flowBStatus: MutationStatus;
  flowBError: string | null;
  mergedItunesId: string | null;
  vendors: VendorState[];
}

const statusColor: Record<MutationStatus, string> = {
  idle: "text-white/30",
  loading: "text-yellow-400",
  pending: "text-yellow-400",
  success: "text-emerald-400",
  error: "text-red-400",
};

const statusLabel: Record<MutationStatus, string> = {
  idle: "idle",
  loading: "pending ⏳",
  pending: "pending ⏳",
  success: "done ✓",
  error: "error ✗",
};

function vendorStateLabel(v: VendorState): { label: string; color: string } {
  if (v.isLoading) return { label: "loading ⏳", color: "text-yellow-400" };
  if (v.isPlaceholderData) return { label: "placeholder 📋", color: "text-blue-400" };
  if (v.isFetching) return { label: "refreshing ↻", color: "text-sky-400" };
  if (v.data === undefined) return { label: "—", color: "text-white/30" };
  if (v.data === null || (typeof v.data === "object" && "error" in v.data))
    return { label: "miss ✗", color: "text-white/40" };
  return { label: "found ✓", color: "text-emerald-400" };
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  const present = value != null && value !== "";
  return (
    <div className="flex gap-2">
      <span className="w-24 shrink-0 text-white/40">{label}</span>
      {present ? (
        <span className="max-w-40 truncate text-white/80">{value}</span>
      ) : (
        <span className="text-red-400/70">null</span>
      )}
    </div>
  );
}

const EnrichmentDebugPanel = ({
  songId,
  trackData,
  isSongDataValid,
  flowAStatus,
  flowBStatus,
  flowBError,
  mergedItunesId,
  vendors,
}: Props) => {
  const [open, setOpen] = useState(true);
  const isSp = songId.startsWith("sp_");

  return (
    <div className="fixed bottom-4 right-4 z-50 w-auto font-mono text-xs text-white">
      {open && (
        <div className="mb-2 rounded-md bg-black/85 p-3 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold text-white/70">Track Debug</span>
            <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/70">
              [−]
            </button>
          </div>

          {/* Song ID */}
          <div className="mb-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`rounded px-1 py-0.5 text-[10px] font-bold ${isSp ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}
              >
                {isSp ? "sp_" : "iTunes"}
              </span>
              <span className="max-w-44 truncate text-white/60">{songId}</span>
            </div>
            {trackData && (
              <div className="mt-1 truncate text-white/50">
                {trackData.song.title} · {trackData.artists[0]?.name}
              </div>
            )}
          </div>

          {/* Data fields */}
          <div className="mb-2 border-b border-white/10 pb-2">
            <div className="mb-1 text-white/30">DATA</div>
            <div className="flex flex-col gap-0.5">
              <Field label="album" value={trackData?.song.album} />
              <Field label="genre" value={trackData?.song.genre} />
              <Field label="spotifyId" value={trackData?.song.spotifyId} />
              <Field label="previewUrl" value={trackData?.song.previewUrl} />
              <Field label="isrc" value={trackData?.song.isrc} />
            </div>
            <div className="mt-1 flex gap-2">
              <span className="text-white/40">valid</span>
              <span className={isSongDataValid ? "text-emerald-400" : "text-red-400"}>
                {isSongDataValid ? "✓ yes" : "✗ no"}
              </span>
            </div>
          </div>

          {/* Enrichment flows */}
          <div className="mb-2 border-b border-white/10 pb-2">
            <div className="mb-1 text-white/30">ENRICHMENT</div>
            <div className="flex flex-col gap-0.5">
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-white/40">A iTunes→Sp</span>
                <span className={statusColor[flowAStatus]}>{statusLabel[flowAStatus]}</span>
              </div>
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-white/40">B sp_→iTunes</span>
                <span className={statusColor[flowBStatus]}>{statusLabel[flowBStatus]}</span>
                {mergedItunesId && (
                  <span className="max-w-28 truncate text-emerald-400/70">({mergedItunesId})</span>
                )}
              </div>

              {flowBError && (
                <div className="flex gap-2">
                  <span className="w-24 shrink-0 text-white/40">error</span>
                  <span className="max-w-32 truncate text-red-400">{flowBError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vendor listings */}
          <div>
            <div className="mb-1 text-white/30">VENDOR LISTINGS</div>
            <div className="flex flex-col gap-0.5">
              {vendors.map((v) => {
                const { label, color } = vendorStateLabel(v);
                return (
                  <div key={v.name} className="flex gap-2">
                    <span className="w-16 shrink-0 text-white/40">{v.name}</span>
                    <span className={color}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="float-right rounded-md bg-black/70 px-3 py-1.5 backdrop-blur-sm hover:bg-black/90"
      >
        Track Debug {isSp ? "🟡" : "🟢"}
      </button>
    </div>
  );
};

export default EnrichmentDebugPanel;
