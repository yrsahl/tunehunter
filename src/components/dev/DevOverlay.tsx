import { resetDevTrpcLog, useDevTrpcLog } from "@/lib/api";
import { useState } from "react";

const DevOverlay = () => {
  const { count, rateLimitedCount, log } = useDevTrpcLog();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-50 font-mono text-xs text-white">
      {open && (
        <div className="mb-2 max-h-80 w-64 overflow-y-auto rounded-md bg-black/80 p-2 backdrop-blur-sm">
          {log.length === 0 && <p className="text-white/50">No calls yet.</p>}
          {log.map((entry) => (
            <p key={entry.index} className={entry.rateLimited ? "text-orange-400" : "text-white/90"}>
              {entry.index}. {entry.path}{entry.rateLimited ? " ⚡" : ""}
            </p>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        onDoubleClick={(e) => { e.stopPropagation(); resetDevTrpcLog(); }}
        className="rounded-md bg-black/70 px-3 py-1.5 backdrop-blur-sm hover:bg-black/90"
      >
        tRPC: {count} <span className="text-orange-400">({rateLimitedCount}/60)</span>
      </button>
    </div>
  );
};

export default DevOverlay;
