import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import SearchTabButton from "./SearchTabButton";
import SearchTabContent from "./SearchTabContent";

// Tabs
export const searchTabs = ["trending", "spotify", "history", "wishlist"] as const;
export type SearchTab = (typeof searchTabs)[number];
export const isSearchTab = (value: string): value is SearchTab =>
  searchTabs.includes(value as SearchTab);

// Subtabs
export const searchSubTabs = [
  "recently_played",
  "queue",
  "most_played",
  "purchases",
  "searches",
] as const;
export type SearchSubTab = (typeof searchSubTabs)[number];
export const isSearchSubTab = (value: string): value is SearchSubTab =>
  searchSubTabs.includes(value as SearchSubTab);

// Relate them
type TabData = {
  tab: SearchTab;
  subTabs: SearchSubTab[];
};
export const searchTabMap: TabData[] = [
  { tab: "trending", subTabs: [] },
  { tab: "spotify", subTabs: ["recently_played", "queue", "most_played"] },
  { tab: "history", subTabs: ["purchases", "searches"] },
  { tab: "wishlist", subTabs: [] },
] as const;
export const isSubTabOfTab = (tab: SearchTab, subTab: SearchSubTab) =>
  searchTabMap.find((data) => data.tab === tab)?.subTabs.includes(subTab) ?? false;

const SearchTabBar = () => {
  const router = useRouterWithHelpers();
  const [activeSearchTab, setActiveSearchTab] = useState<SearchTab | "">("");

  // Restore active tab if param is present
  useEffect(() => {
    const searchParam = router.getParams("search");
    if (router.isReady && searchParam && isSearchTab(searchParam)) {
      setActiveSearchTab(searchParam);
    } else {
      setActiveSearchTab("");
    }
  }, [router.isReady, router.query]);

  return (
    <>
      <div className="flex min-w-0 flex-wrap justify-center gap-4">
        {searchTabs.map((searchTab) => (
          <SearchTabButton
            searchTab={searchTab}
            activeSearchTab={activeSearchTab}
            setActiveSearchTab={setActiveSearchTab}
            key={searchTab}
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
