import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import SortHeader from "./SortHeader";

interface TableSortHeadProps {
  sort: string;
  onToggleSort: (asc: string, desc: string) => void;
  onReset?: () => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  hasExtraElement?: boolean;
}

const TableSortHead = ({
  sort,
  onToggleSort,
  onReset,
  filterValue,
  onFilterChange,
  hasExtraElement,
}: TableSortHeadProps) => (
  <thead>
    <tr>
      <th className="w-[56px] py-2 pr-4 sm:w-[132px] sm:pr-6" colSpan={hasExtraElement ? 2 : 1}>
        <form onSubmit={(e) => e.preventDefault()} className="relative hidden sm:block">
          <Input
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            className="h-8 border-foreground/20 bg-transparent pl-8 pr-2 text-sm font-light placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2">
            <SearchIcon size={14} className="text-foreground" />
          </span>
        </form>
      </th>
      <th className="w-[30%] py-2 pr-5 text-left font-normal sm:w-[28%] sm:pr-6">
        <SortHeader
          label="Artist"
          isActive={sort === "artist_az" || sort === "artist_za"}
          isAsc={sort === "artist_az"}
          onClick={() => onToggleSort("artist_az", "artist_za")}
        />
      </th>
      <th className="w-[48%] py-2 pl-1 pr-2 text-left font-normal sm:w-[52%] sm:pl-2 sm:pr-4">
        <SortHeader
          label="Song"
          isActive={sort === "song_az" || sort === "song_za"}
          isAsc={sort === "song_az"}
          onClick={() => onToggleSort("song_az", "song_za")}
        />
      </th>
      <th className="hidden w-[60px] py-2 pr-2 text-left font-normal sm:table-cell sm:pr-4">
        <SortHeader
          label="Time"
          isActive={sort === "duration_asc" || sort === "duration_desc"}
          isAsc={sort === "duration_asc"}
          onClick={() => onToggleSort("duration_asc", "duration_desc")}
        />
      </th>
      <th className="hidden w-[96px] py-2 text-right font-normal sm:table-cell">
        {onReset && (
          <button
            onClick={onReset}
            className="text-xs text-foreground/40 transition hover:text-foreground/70"
          >
            Reset
          </button>
        )}
      </th>
    </tr>
  </thead>
);

export default TableSortHead;
