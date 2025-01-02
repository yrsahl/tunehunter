import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { AnimatePresence, motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import SearchTab from "./SearchTab";
import SearchTabContent from "./SearchTabContent";

interface IProps {}

const searchTabs = ["trending", "spotify", "history", "wishlist"] as const;
export type SearchTabType = (typeof searchTabs)[number];
const isSearchTab = (tab: string): tab is SearchTabType =>
  searchTabs.includes(tab as SearchTabType);

const SearchTabBar: FC<IProps> = ({}) => {
  const router = useRouterWithHelpers();
  const [activeSearchTab, setActiveSearchTab] = useState<SearchTabType | "">("");

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
        {searchTabs.map((searchTabVariant) => (
          <SearchTab
            searchTab={searchTabVariant}
            activeSearchTab={activeSearchTab}
            setActiveSearchTab={setActiveSearchTab}
          />
        ))}
      </div>
      <AnimatePresence mode="wait">
        {activeSearchTab !== "" && (
          <motion.div
            initial={{ height: "0rem" }}
            animate={{ height: "16rem" }}
            exit={{ height: "0rem" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="relative mt-4 h-full w-full resize-y overflow-hidden rounded-3xl border-[1px] border-foreground/30 bg-primary/10 md:w-4/5 "
          >
            <SearchTabContent activeTab={activeSearchTab} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchTabBar;
