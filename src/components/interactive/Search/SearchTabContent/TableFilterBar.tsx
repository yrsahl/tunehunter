import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
}

interface TableFilterBarProps {
  filterValue: string;
  onFilterChange: (value: string) => void;
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: SortOption[];
  filterPlaceholder?: string;
}

const TableFilterBar = ({
  filterValue,
  onFilterChange,
  sortValue,
  onSortChange,
  sortOptions,
  filterPlaceholder = "Filter by song or artist…",
}: TableFilterBarProps) => {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-foreground/10 px-3 py-1 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder={filterPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      {sortOptions && onSortChange && (
        <Select value={sortValue} onValueChange={onSortChange}>
          <SelectTrigger className="h-auto w-auto shrink-0 gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary/70 shadow-none outline-none ring-0 focus:ring-transparent [&>svg]:h-3 [&>svg]:w-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-foreground/30 bg-background/30 backdrop-blur-md">
            <SelectGroup>
              {sortOptions.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="text-xs ring-0 [&:not(:last-child)]:pb-2"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default TableFilterBar;
