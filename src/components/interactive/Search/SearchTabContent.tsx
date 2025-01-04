import { LoadingIndicator } from "@/components/Indicators";
import { fadeInAndOut } from "@/helpers/animations";
import useTabContentData from "@/hooks/useTabContentData";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { HistoryTab, SpotifyTab, Tab, TrendingTab, WishlistTab } from "./SearchTabBar";

const spotifySubTabs = ["recently_played", "queue", "most_played"] as const;
const trendingSubTabs = [] as const;
const historySubTabs = ["purchases", "searches"] as const;
const wishlistSubTabs = [] as const;

type SpotifySubTab = (typeof spotifySubTabs)[number];
type TrendingSubTab = (typeof trendingSubTabs)[number];
type HistorySubTab = (typeof historySubTabs)[number];
type WishlistSubTab = (typeof wishlistSubTabs)[number];

type SubTabMap = {
  spotify: SpotifySubTab;
  trending: TrendingSubTab;
  history: HistorySubTab;
  wishlist: WishlistSubTab;
};

type SubTab<T extends Tab> = T extends keyof SubTabMap ? SubTabMap[T] : never;

const subTabsMap = {
  spotify: spotifySubTabs,
  trending: trendingSubTabs,
  history: historySubTabs,
  wishlist: wishlistSubTabs,
};

const emptyTabMessageMap: Record<Tab, SubTab<Tab>> = {
  trending: "No data to display",
  spotify: {
    recently_played: "No recently played songs to display",
    queue: "No queue to display",
    most_played: "No most played songs to display",
  },
  history: {
    purchases: "No purchases to display",
    searches: "No searches to display",
  },
  wishlist: "Your wishlist is empty. Add songs by clicking the heart icon on the results page!",
};

interface SearchTabContentProps {
  activeTab: SpotifyTab | TrendingTab | HistoryTab | WishlistTab;
}

const SearchTabContent = <T extends SpotifyTab | TrendingTab | HistoryTab | WishlistTab>({
  activeTab,
}: SearchTabContentProps) => {
  // Set to first subtab of tab, if there are any
  const [activeSubTab, setActiveSubTab] = useState<SubTabMap[T]>();

  if (activeTab === "spotify") setActiveSubTab("queue");

  const { data, isLoading } = useTabContentData(activeTab);
  const tabHasSubTabs = subTabsMap[activeTab].length > 0;

  const noDataMessage =
    tabHasSubTabs && activeSubTab
      ? emptyTabMessageMap[activeTab][activeSubTab]
      : emptyTabMessageMap[activeTab];

  return (
    <>
      {tabHasSubTabs && (
        <div className="border-x-1 absolute left-1/2 top-0 z-10 flex w-auto -translate-x-1/2 justify-around gap-16 rounded-b-sm border-b-[1px] border-primary bg-background px-6 py-[6px]">
          {subTabsMap[activeTab].map((subTab) => {
            return (
              <button
                key={subTab}
                className={cn(
                  "whitespace-nowrap text-base capitalize transition-colors hover:text-foreground",
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
      {isLoading && (
        <div className="flex h-full justify-center">
          <LoadingIndicator size={60} />
        </div>
      )}
      {!data && !isLoading && (
        <div className="flex h-full max-w-[66%] items-center justify-center text-center">
          <p>{noDataMessage}</p>
        </div>
      )}
      {!!data && (
        <div className="hide-scrollbars relative h-full w-full overflow-scroll pb-6 pt-12">
          <table className="w-full">
            <AnimatePresence mode="wait">
              <motion.tbody key={activeSubTab} {...fadeInAndOut(0.15)}>
                Hi
                {/* {activeTab === "trending" && <TableRow data={data} />}
              {activeTab === "spotify"} && <SpotifyTableRow data={data} />}
              {activeTab === "history" && <HistoryTableRow data={data} />}
              {activeTab === "wishlist" && <WishlistTableRow data={data} />} */}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
      )}
    </>
  );
};

export default SearchTabContent;
