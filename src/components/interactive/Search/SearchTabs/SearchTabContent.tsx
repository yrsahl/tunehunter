import useDeviceSize from "@/hooks/useDeviceSize";
import { cn } from "@/lib/utils";
import { fadeInAndOut } from "@/styles/animations";
import { AnimatePresence, motion } from "framer-motion";
import HistoryTable from "../SearchTabContent/HistoryTable";
import PlaylistTable from "../SearchTabContent/PlaylistTable";
import TrendingTable from "../SearchTabContent/TrendingTable";
import WishlistTable from "../SearchTabContent/WishlistTable";
import { SearchTab } from "./SearchTabBar";

interface SearchTabContentProps {
  activeSearchTab: SearchTab;
}

const SearchTabContent = ({ activeSearchTab }: SearchTabContentProps) => {
  const { isMobileDevice } = useDeviceSize();

  const contentHeight = isMobileDevice ? "12rem" : "16rem";

  return (
    <motion.div
      initial={{ height: "0rem", opacity: 0 }}
      animate={{ height: contentHeight, opacity: 1 }}
      exit={{ height: "0rem", opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="relative h-full w-full resize-y overflow-hidden rounded-3xl border-[1px] border-foreground/30 bg-primary/10 sm:pt-0 md:w-4/5 "
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSearchTab}
          {...fadeInAndOut(0.2)}
          className={cn("relative mx-auto flex h-full w-full flex-col items-center")}
        >
          {activeSearchTab === "trending" && <TrendingTable />}
          {activeSearchTab === "playlist" && <PlaylistTable />}
          {activeSearchTab === "history" && <HistoryTable />}
          {activeSearchTab === "wishlist" && <WishlistTable />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchTabContent;
