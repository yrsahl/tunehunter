import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { SearchTab } from "./SearchTabBar";
import HistoryTable from "./SearchTabContent/HistoryTable";
import SpotifyTable from "./SearchTabContent/SpotifyTable";
import TrendingTable from "./SearchTabContent/TrendingTable";
import WishlistTable from "./SearchTabContent/WishlistTable";

interface SearchTabContentProps {
  activeSearchTab: SearchTab;
}

const SearchTabContent = ({ activeSearchTab }: SearchTabContentProps) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ height: "0rem" }}
        animate={{ height: "16rem" }}
        exit={{ height: "0rem" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative mt-4 h-full w-full resize-y overflow-hidden rounded-3xl border-[1px] border-foreground/30 bg-primary/10 md:w-4/5 "
      >
        {/* Fade content on tab change */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          key={activeSearchTab}
          className={cn("relative mx-auto flex h-full w-full flex-col items-center")}
        >
          {activeSearchTab === "trending" && <TrendingTable />}
          {activeSearchTab === "spotify" && <SpotifyTable />}
          {activeSearchTab === "history" && <HistoryTable />}
          {activeSearchTab === "wishlist" && <WishlistTable />}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchTabContent;
