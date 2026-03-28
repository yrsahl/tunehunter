import useDeviceSize from "@/hooks/useDeviceSize";
import { useActiveSearchTabStore } from "@/hooks/stores/useActiveSearchTab";
import { cn } from "@/lib/utils";
import { fadeIn } from "@/styles/animations";
import { motion } from "framer-motion";
import { useRef } from "react";
import HistoryTable from "../SearchTabContent/HistoryTable";
import PlaylistTable from "../SearchTabContent/PlaylistTable";
import TrendingTable from "../SearchTabContent/TrendingTable";
import FavoritesTable from "../SearchTabContent/FavoritesTable";
import { SearchTab } from "./SearchTabBar";

interface SearchTabContentProps {
  activeSearchTab: SearchTab;
}

const SearchTabContent = ({ activeSearchTab }: SearchTabContentProps) => {
  const { isMobileDevice } = useDeviceSize();
  const { tabContentHeight, setTabContentHeight } = useActiveSearchTabStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef(false);

  const defaultHeight = isMobileDevice ? "12rem" : "16rem";
  const animateHeight = tabContentHeight || defaultHeight;

  const handlePointerUp = () => {
    if (!containerRef.current) return;
    isResizing.current = true;
    setTabContentHeight(`${containerRef.current.offsetHeight}px`);
    requestAnimationFrame(() => { isResizing.current = false; });
  };

  return (
    <motion.div
      ref={containerRef}
      onPointerUp={handlePointerUp}
      initial={{ height: "0rem", opacity: 0 }}
      animate={{ height: animateHeight, opacity: 1 }}
      exit={{ height: "0rem", opacity: 0 }}
      transition={isResizing.current ? { duration: 0 } : { duration: 0.5, ease: "easeInOut" }}
      className="relative h-full w-full resize-y overflow-hidden rounded-3xl border-[1px] border-foreground/30 bg-primary/10 sm:pt-0 md:w-4/5 "
    >
      <motion.div
        key={activeSearchTab}
        {...fadeIn(0.2)}
        className={cn("relative mx-auto flex h-full w-full flex-col items-center")}
      >
        {activeSearchTab === "trending" && <TrendingTable />}
        {activeSearchTab === "playlist" && <PlaylistTable />}
        {activeSearchTab === "history" && <HistoryTable />}
        {activeSearchTab === "favorites" && <FavoritesTable />}
      </motion.div>
    </motion.div>
  );
};

export default SearchTabContent;
