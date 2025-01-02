import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { FC, useEffect, useState } from "react";
import HistoryTable from "../SongTables/HistoryTable";
import SpotifyTable from "../SongTables/SpotifyTable";
import TrendingTable from "../SongTables/TrendingTable";
import WishlistTable from "../SongTables/WishlistTable";
import SearchTab from "./SearchTab";

interface IProps {}

const searchTabVariants = ["trending", "spotify", "history", "wishlist"] as const;
export type SearchTabVariant = (typeof searchTabVariants)[number];
const isSearchTabVariant = (tab: string): tab is SearchTabVariant =>
  searchTabVariants.includes(tab as SearchTabVariant);

const SearchTabBar: FC<IProps> = ({}) => {
  const router = useRouterWithHelpers();
  const [activeSearchTab, setActiveSearchTab] = useState<SearchTabVariant | "">("");
  const { status: sessionStatus } = useSession();
  const loggedIn = sessionStatus === "authenticated";

  // Restore active tab if param is present
  useEffect(() => {
    const searchParam = router.getParams("search");
    if (router.isReady && searchParam && isSearchTabVariant(searchParam)) {
      setActiveSearchTab(searchParam);
    } else {
      setActiveSearchTab("");
    }
  }, [router.isReady, router.query]);

  const tableContent = {
    "": <></>,
    spotify: <SpotifyTable />,
    trending: <TrendingTable setSearchTab={setActiveSearchTab} />,
    history: <HistoryTable />,
    wishlist: <WishlistTable />,
  };

  return (
    <>
      <div className="flex min-w-0 flex-wrap justify-center gap-4">
        {searchTabVariants.map((searchTabVariant) => (
          <SearchTab
            tabVariant={searchTabVariant}
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
            className="mt-4 h-full w-full resize-y overflow-hidden rounded-3xl border-[1px] border-foreground/30 bg-primary/10 md:w-4/5 "
          >
            <motion.div
              initial={{ opacity: loggedIn ? 0 : 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: loggedIn ? 0 : 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              key={activeSearchTab}
              className={cn("relative mx-auto flex h-full w-full flex-col items-center")}
            >
              {tableContent[activeSearchTab]}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchTabBar;
