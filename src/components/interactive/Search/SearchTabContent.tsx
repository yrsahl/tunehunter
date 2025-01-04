import { LoadingIndicator } from "@/components/Indicators";
import { fadeInAndOut } from "@/helpers/animations";
import useTabContentData from "@/hooks/useTabContentData";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Tab } from "./SearchTabBar";

export const spotifySubTabs = ["recently_played", "queue", "most_played"] as const;
export const trendingSubTabs = [] as const;
export const historySubTabs = ["purchases", "searches"] as const;
export const wishlistSubTabs = [] as const;
export type SubTabs = {
  trending: (typeof trendingSubTabs)[number];
  spotify: (typeof spotifySubTabs)[number];
  history: (typeof historySubTabs)[number];
  wishlist: (typeof wishlistSubTabs)[number];
};
export type SubTab = SubTabs[Tab];

// [K in Tab]: Ensures that there is a K(ey) for each Tab (e.g. "trending") in the Map
// Then: For each Key the format must be SubTabErrorMessages for that current Key (e.g. "trending")
type EmptyTabMessageMap = {
  [K in Tab]: SubTabErrorMessages<K>;
};
// Type must be of Tab (e.g. "trending")
// [K in SubTabs[T]]: string -> For each Key in SubTabs, eg. "trending", there must be a string value
type SubTabErrorMessages<T extends Tab> = {
  [K in SubTabs[T]]: string;
};

const subTabsMap = {
  spotify: spotifySubTabs,
  trending: trendingSubTabs,
  history: historySubTabs,
  wishlist: wishlistSubTabs,
};
const emptyTabMessageMap: EmptyTabMessageMap = {
  trending: "Nothing's trending right now...",
  spotify: {
    recently_played: "You haven't listened to anything yet.",
    queue: "Your queue is empty.",
    most_played: "You haven't listened to anything yet.",
  },
  history: {
    searches: "You haven't searched for anything yet.",
    purchases: "You haven't purchased anything yet.",
  },
  wishlist:
    "Your wishlist is empty. Add songs by clicking the heart icon next to songs on the results page!",
};

interface SearchTabContentProps {
  activeTab: Tab;
}

const SearchTabContent = ({ activeTab }: SearchTabContentProps) => {
  // Set to first subtab of tab, if there are any
  const [activeSubTab, setActiveSubTab] = useState<SubTab | undefined>(
    subTabsMap[activeTab].length > 0 ? subTabsMap[activeTab][0] : undefined,
  );
  const { data, isLoading } = useTabContentData(activeTab);
  const tabHasSubTabs = subTabsMap[activeTab].length > 0;

  const noDataMessage =
    tabHasSubTabs && activeSubTab && activeSubTab in emptyTabMessageMap[activeTab]
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
