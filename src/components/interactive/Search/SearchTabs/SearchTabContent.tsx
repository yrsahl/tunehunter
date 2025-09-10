import { cn } from "@/lib/utils";
import { fadeInAndOut } from "@/styles/animations";
import { motion } from "framer-motion";
import HistoryTable from "../SearchTabContent/HistoryTable";
import SpotifyTable from "../SearchTabContent/SpotifyTable";
import TrendingTable from "../SearchTabContent/TrendingTable";
import WishlistTable from "../SearchTabContent/WishlistTable";
import { SearchTab } from "./SearchTabBar";

interface SearchTabContentProps {
  activeSearchTab: SearchTab;
}

const SearchTabContent = ({ activeSearchTab }: SearchTabContentProps) => {
  return (
    <motion.div
      initial={{ height: "0rem" }}
      animate={{ height: "16rem" }}
      exit={{ height: "0rem" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="relative h-full w-full resize-y overflow-hidden rounded-3xl border-[1px] border-foreground/30 bg-primary/10 sm:pt-0 md:w-4/5 "
    >
      {/* Fade content on tab change */}
      <motion.div
        {...fadeInAndOut(0.5)}
        className={cn("relative mx-auto flex h-full w-full flex-col items-center")}
      >
        {activeSearchTab === "trending" && <TrendingTable />}
        {activeSearchTab === "spotify" && <SpotifyTable />}
        {activeSearchTab === "history" && <HistoryTable />}
        {activeSearchTab === "wishlist" && <WishlistTable />}
      </motion.div>
    </motion.div>
  );
};

export default SearchTabContent;
