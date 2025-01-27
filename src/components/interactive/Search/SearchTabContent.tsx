import { LoadingIndicator } from "@/components/Indicators";
import { useSearchTabData } from "@/contexts/SearchTabDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { SearchSubTab, SearchTab, searchTabMap } from "./SearchTabBar";
import HistoryTable from "./SearchTabContent/HistoryTable";
import SpotifyTable from "./SearchTabContent/SpotifyTable";
import TrendingTable from "./SearchTabContent/TrendingTable";
import WishlistTable from "./SearchTabContent/WishlistTable";

const emptyTabMessageMap: Record<SearchTab, string> = {
  trending: "Nothing's trending right now...",
  spotify: "",
  history: "",
  wishlist: "Your wishlist is empty! Add songs by clicking the heart icon on the results page.",
};

const emptySubTabMessageMap: Record<SearchSubTab, string> = {
  recently_played: "You haven't listened to anything on Spotify recently!",
  queue: "Your queue is empty!",
  most_played: "Songs you've played the most (in Spotify) will appear here!",
  purchases: "Your recent purchases will appear here!",
  searches: "Your recent searches will appear here!",
};

interface SearchTabContentProps {
  activeTab: SearchTab;
}

const SearchTabContent = ({ activeTab }: SearchTabContentProps) => {
  const subTabs = searchTabMap.find((data) => data.tab === activeTab)?.subTabs;
  const hasSubTabs = subTabs && subTabs.length > 0;

  // Set to first subtab of tab, if there are any
  const [activeSubTab, setActiveSubTab] = useState<SearchSubTab | undefined>(
    subTabs?.[0] ?? undefined,
  );
  const noDataMessage = activeSubTab
    ? emptySubTabMessageMap[activeSubTab]
    : emptyTabMessageMap[activeTab];

  const { isTabDataLoading, isTabDataReady } = useSearchTabData();
  const isDataLoading = isTabDataLoading(activeTab);
  const isDataReady = isTabDataReady(activeTab);

  return (
    <>
      {hasSubTabs && (
        <div className="border-x-1 absolute left-1/2 top-0 z-10 flex w-auto -translate-x-1/2 justify-around gap-0 rounded-b-sm border-b-[1px] border-primary bg-background px-6 py-[6px]">
          {subTabs.map((subTab) => {
            return (
              <button
                key={subTab}
                className={cn(
                  // Hardcoded width of 32 to make all buttons the same size as the largest one (min-w-0 flex-1 doesn't work here)
                  "flex w-32 justify-center whitespace-nowrap text-base capitalize transition-colors hover:text-foreground",
                  subTab === activeSubTab ? "text-foreground" : "text-muted-foreground",
                )}
                onClick={() => setActiveSubTab(subTab)}
              >
                {subTab.replace("_", " ")}
              </button>
            );
          })}
        </div>
      )}
      {isDataLoading && (
        <div className="flex h-full justify-center">
          <LoadingIndicator size={60} />
        </div>
      )}
      {!isDataLoading && !isDataReady && (
        <div className="flex h-full max-w-[66%] items-center justify-center text-center">
          <p>{noDataMessage}</p>
        </div>
      )}
      {isDataReady && (
        <AnimatePresence mode="wait">
          <div className="h-full w-full px-3 sm:px-5 md:px-7">
            <motion.div
              className="hide-scrollbars relative h-full w-full overflow-scroll pb-6 pt-12"
              key={activeSubTab}
              {...fadeInAndOut(0.15)}
            >
              {activeTab === "trending" && <TrendingTable />}
              {activeTab === "spotify" && <SpotifyTable activeTab={activeSubTab} />}
              {activeTab === "history" && <HistoryTable activeTab={activeSubTab} />}
              {activeTab === "wishlist" && <WishlistTable />}
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </>
  );
};

export default SearchTabContent;
