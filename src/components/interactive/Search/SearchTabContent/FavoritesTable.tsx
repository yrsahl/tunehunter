import useFavorites from "@/hooks/useFavorites";
import { fadeIn } from "@/styles/animations";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useState } from "react";
import FavoritesStatusIcon from "./FavoritesStatusIcon";
import NoDataMessage from "./NoDataMessage";
import SkeletonTable from "./SkeletonTable";
import TableFilterBar, { type SortOption } from "./TableFilterBar";
import TableRow from "./TableRow";

type FavoritesSortKey =
  | "date_desc"
  | "date_asc"
  | "song_az"
  | "song_za"
  | "artist_az"
  | "year_desc"
  | "duration_asc";

const SORT_OPTIONS: SortOption[] = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "song_az", label: "Song A → Z" },
  { value: "song_za", label: "Song Z → A" },
  { value: "artist_az", label: "Artist A → Z" },
  { value: "year_desc", label: "Year (newest)" },
  { value: "duration_asc", label: "Duration" },
];

const FavoritesTable = () => {
  const { favoritesData, favoritesDataIsLoading } = useFavorites();
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<FavoritesSortKey>("date_desc");

  const filtered = (favoritesData ?? []).filter((t) => {
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
      case "song_za":
        return b.song.title.localeCompare(a.song.title);
      case "artist_az":
        return (a.artists[0]?.name ?? "").localeCompare(b.artists[0]?.name ?? "");
      case "year_desc":
        return parseInt(b.song.year || "0") - parseInt(a.song.year || "0");
      case "duration_asc":
        return a.song.duration - b.song.duration;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return favoritesDataIsLoading ? (
    <motion.div key="skeleton" {...fadeIn(0.3)} className="h-full w-full">
      <SkeletonTable hasHeader={false} hasExtraElement />
    </motion.div>
  ) : favoritesData?.length ? (
    <motion.div key="content" {...fadeIn(0.3)} className="flex h-full w-full flex-col">
      <TableFilterBar
        filterValue={filter}
        onFilterChange={setFilter}
        sortValue={sort}
        onSortChange={(v) => setSort(v as FavoritesSortKey)}
        sortOptions={SORT_OPTIONS}
      />
      <div className="hide-scrollbars relative flex-1 overflow-scroll overflow-x-hidden px-3 pb-4 pt-2 sm:px-5 sm:pt-4 md:px-7">
        {displayed.length > 0 ? (
          <table className="w-full table-fixed">
            <tbody>
              <LayoutGroup id="favorites">
                <AnimatePresence>
                  {displayed.map((track) => (
                    <TableRow
                      key={track.song.id}
                      track={track}
                      showDuration
                      extraElement={<FavoritesStatusIcon variant="small" songId={track.song.id} />}
                    />
                  ))}
                </AnimatePresence>
              </LayoutGroup>
            </tbody>
          </table>
        ) : (
          <NoDataMessage message="No songs match your filter." />
        )}
      </div>
    </motion.div>
  ) : (
    <motion.div key="empty" {...fadeIn(0.2)} className="h-full w-full">
      <NoDataMessage message="Your favorites are empty! Add songs by clicking the heart icon on the results page." />
    </motion.div>
  );
};

export default FavoritesTable;
