import InfoWithToolTip from "@/components/InfoWithTooltip";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { formatDate } from "@/lib/formatters";
import { fadeIn } from "@/styles/animations";
import { motion } from "framer-motion";
import { useState } from "react";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableFilterBar, { type SortOption } from "./TableFilterBar";
import TableRow from "./TableRow";

type HistorySortKey = "date_desc" | "date_asc" | "song_az" | "artist_az";

const SORT_OPTIONS: SortOption[] = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "song_az", label: "Song A → Z" },
  { value: "artist_az", label: "Artist A → Z" },
];

const HistoryTable = () => {
  const {
    history: { data, isLoading },
  } = useSearchTabDataContext();
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<HistorySortKey>("date_desc");

  const searchHistory = data?.searchHistory;

  const filtered = (searchHistory ?? []).filter((t) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      t.song.title.toLowerCase().includes(q) ||
      t.artists.some((a) => a.name.toLowerCase().includes(q))
    );
  });

  const displayed = [...filtered].sort((a, b) => {
    switch (sort) {
      case "date_asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "song_az":
        return a.song.title.localeCompare(b.song.title);
      case "artist_az":
        return (a.artists[0]?.name ?? "").localeCompare(b.artists[0]?.name ?? "");
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return isLoading ? (
    <motion.div key="skeleton" {...fadeIn(0.3)} className="h-full w-full">
      <SkeletonTable hasHeader={false} hasExtraElement />
    </motion.div>
  ) : searchHistory?.length ? (
    <motion.div key="content" {...fadeIn(0.3)} className="flex h-full w-full flex-col">
      <TableFilterBar
        filterValue={filter}
        onFilterChange={setFilter}
        sortValue={sort}
        onSortChange={(v) => setSort(v as HistorySortKey)}
        sortOptions={SORT_OPTIONS}
      />
      <div className="hide-scrollbars relative flex-1 overflow-scroll overflow-x-hidden px-3 pb-4 pt-2 sm:px-5 sm:pt-4 md:px-7">
        {displayed.length > 0 ? (
          <table className="w-full table-fixed">
            <tbody>
              {displayed.map((track, index) => (
                <TableRow
                  key={`${index}-${track.song.id}`}
                  track={track}
                  showDuration
                  extraElement={
                    <InfoWithToolTip
                      variant="primary"
                      tooltip={`Searched for on the ${formatDate(track.createdAt)} `}
                    />
                  }
                />
              ))}
            </tbody>
          </table>
        ) : (
          <NoDataMessage message="No songs match your filter." />
        )}
      </div>
    </motion.div>
  ) : (
    <motion.div key="empty" {...fadeIn(0.2)} className="h-full w-full">
      <NoDataMessage message="Your recent searches will appear here!" />
    </motion.div>
  );
};

export default HistoryTable;
