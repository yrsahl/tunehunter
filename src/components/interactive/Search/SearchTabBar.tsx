import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import SearchTab from "./SearchTab";
import SearchTabContent from "./SearchTabContent";

interface IProps {}

const tabs = ["trending", "spotify", "history", "wishlist"] as const;
export type SpotifyTab = "spotify";
export type TrendingTab = "trending";
export type HistoryTab = "history";
export type WishlistTab = "wishlist";
export type Tab = SpotifyTab | TrendingTab | HistoryTab | WishlistTab;
const isTab = (tab: string): tab is Tab => tabs.includes(tab as Tab);

const SearchTabBar: FC<IProps> = ({}) => {
  const router = useRouterWithHelpers();
  const [activeSearchTab, setActiveSearchTab] = useState<Tab | "">("");

  // Restore active tab if param is present
  useEffect(() => {
    const searchParam = router.getParams("search");
    if (router.isReady && searchParam && isTab(searchParam)) {
      setActiveSearchTab(searchParam);
    } else {
      setActiveSearchTab("");
    }
  }, [router.isReady, router.query]);

  return (
    <>
      <div className="flex min-w-0 flex-wrap justify-center gap-4">
        {tabs.map((searchTabVariant) => (
          <SearchTab
            searchTab={searchTabVariant}
            activeSearchTab={activeSearchTab}
            setActiveSearchTab={setActiveSearchTab}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        {activeSearchTab !== "" && (
          // Grow on open and shrink on close
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
              <SearchTabContent activeTab={activeSearchTab} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchTabBar;
