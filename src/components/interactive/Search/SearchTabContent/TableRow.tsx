import IconButton from "@/components/IconButton";
import useSearch from "@/hooks/useSearch";
import { Track } from "@/types/song";
import clsx from "clsx";
import { ReactNode } from "react";

interface TableRowProps {
  track: Track;
  showDuration?: boolean;
  extraElement?: ReactNode;
}

const TableRow = ({ track, showDuration = false, extraElement }: TableRowProps) => {
  const { startSearch } = useSearch();
  const { song, artists } = track;

  return (
    <tr className="max-h-16" key={song.id}>
      <td className="py-2 pr-8">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="mask mask-squircle h-12 w-12">
              {song.albumArtUrl && <img src={song.albumArtUrl} />}
              {!song.albumArtUrl && (
                <div className="flex h-full w-full items-center justify-center bg-gray-200">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </td>
      {/* Extra Element */}
      <td className={clsx("align-middle", extraElement ? "pr-6" : "pr-0")}>
        <div className="flex">{extraElement}</div>
      </td>
      {/* Artist(s) */}
      <td className="pr-4">
        <p>{artists[0]?.name}</p>
        {artists[1] && (
          <p className="overflow-ellipsis whitespace-nowrap text-muted-foreground">
            {artists[1].name}
          </p>
        )}
      </td>
      {/* Title */}
      <td className="pr-4">
        <span>{song.title}</span>
      </td>
      {/* Duration */}
      {showDuration && (
        <td className="pr-4 text-foreground/50">
          <span>{new Date(song.duration).toISOString().substr(14, 5)}</span>
        </td>
      )}
      {/* Search */}
      <td className="pl-4 text-right">
        <IconButton
          variant="primary"
          text="Search"
          size="sm"
          onClick={() => startSearch(song.id)}
        />
      </td>
    </tr>
  );
};

export default TableRow;
