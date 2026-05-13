import InfoWithToolTip from "@/components/InfoWithTooltip";
import { Input } from "@/components/ui/input";
import { useSearchTabDataContext } from "@/contexts/SearchTabDataContext";
import { formatDate } from "@/lib/formatters";
import { fadeIn } from "@/styles/animations";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { SearchIcon } from "lucide-react";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableRow from "./TableRow";
import TableSortHead from "./TableSortHead";
import useTableSort from "./useTableSort";

type HistorySortKey =
  | "date_desc"
  | "date_asc"
  | "song_az"
  | "song_za"
  | "artist_az"
  | "artist_za"
  | "duration_asc"
  | "duration_desc";

const HistoryTable = () => {
  const {
    history: { data, isLoading },
  } = useSearchTabDataContext();
  const { sort, setSort, toggleSort, filter, setFilter, scrollRef } =
    useTableSort<HistorySortKey>("date_desc");

  const searchHistory = data?.searchHistory;

  const displayed = [...(searchHistory ?? [])]
    .filter((t) => {
      if (!filter) return true;
      const q = filter.toLowerCase();
      return (
        t.song.title.toLowerCase().includes(q) ||
        t.artists.some((a) => a.name.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
    switch (sort) {
      case "date_asc":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "song_az":
        return a.song.title.localeCompare(b.song.title);
      case "song_za":
        return b.song.title.localeCompare(a.song.title);
      case "artist_az":
        return (a.artists[0]?.name ?? "").localeCompare(b.artists[0]?.name ?? "");
      case "artist_za":
        return (b.artists[0]?.name ?? "").localeCompare(a.artists[0]?.name ?? "");
      case "duration_asc":
        return a.song.duration - b.song.duration;
      case "duration_desc":
        return b.song.duration - a.song.duration;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return isLoading ? (
    <motion.div key="skeleton" {...fadeIn(0.3)} className="h-full w-full">
      <SkeletonTable hasHeader={false} hasExtraElement />
    </motion.div>
  ) : searchHistory?.length ? (
    <motion.div
      key="content"
      {...fadeIn(0.3)}
      className="flex h-full w-full flex-col overflow-hidden"
    >
      <div className="shrink-0 px-3 sm:px-5 md:px-7">
        <table className="w-full table-fixed">
          <TableSortHead
            sort={sort}
            onToggleSort={toggleSort}
            onReset={sort === "date_desc" && !filter ? undefined : () => { setSort("date_desc"); setFilter(""); }}
            hasExtraElement
          />
        </table>
      </div>
      <div
        ref={scrollRef}
        className="hide-scrollbars flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 pt-2 [mask-image:linear-gradient(to_bottom,transparent_0px,black_12px)] sm:px-5 md:px-7"
      >
        {displayed.length > 0 ? (
          <table className="w-full table-fixed">
            <tbody>
              <LayoutGroup id="history">
                <AnimatePresence>
                  {displayed.map((track) => (
                    <TableRow
                      key={`${track.song.id}-${track.createdAt}`}
                      track={track}
                      showDuration
                      extraElement={
                        <InfoWithToolTip variant="primary" tooltip={formatDate(track.createdAt)} />
                      }
                    />
                  ))}
                </AnimatePresence>
              </LayoutGroup>
              <tr>
                <td colSpan={99} className="pb-1 pt-3">
                  <form onSubmit={(e) => e.preventDefault()} className="relative mx-auto w-[80%]">
                    <Input
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="h-8 border-foreground/20 bg-transparent pl-8 pr-2 text-sm font-light placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2">
                      <SearchIcon size={14} className="text-foreground" />
                    </span>
                  </form>
                </td>
              </tr>
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
