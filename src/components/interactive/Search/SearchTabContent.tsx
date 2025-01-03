import { LoadingIndicator } from "@/components/Indicators";
import useTabContentData from "@/hooks/useTabContentData";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Tab } from "./SearchTabBar";

export const spotifySubTabs = ["recently_played", "queue", "top_tracks"] as const;
export const trendingSubTabs = [] as const;
export const historySubTabs = ["purchases", "searches"] as const;
export const wishlistSubTabs = [] as const;
const subTabsMap = {
  spotify: spotifySubTabs,
  trending: trendingSubTabs,
  history: historySubTabs,
  wishlist: wishlistSubTabs,
};
export type SpotifySubTab = (typeof spotifySubTabs)[number];
export type TrendingSubTab = (typeof trendingSubTabs)[number];
export type HistorySubTab = (typeof historySubTabs)[number];
export type WishlistSubTab = (typeof wishlistSubTabs)[number];
export type SubTab = SpotifySubTab | TrendingSubTab | HistorySubTab | WishlistSubTab;

const emptyTabMessageMap: Record<Tab, string> = {
  spotify: "We couldn't find any data for this tab.",
  trending: "Nothing's trending right now...",
  history: "You haven't searched for anything yet.",
  wishlist:
    "Your wishlist is empty. Add songs by clicking the heart icon next to songs on the results page!",
};

interface SearchTabContentProps {
  activeTab: Tab;
}

const SearchTabContent = ({ activeTab }: SearchTabContentProps) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>();
  const { data, isLoading } = useTabContentData({ tab: "spotify", subTab: "queue" });

  // if (activeTab === "spotify") setActiveSubTab("queue");

  const tabHasSubTabs = subTabsMap[activeTab].length > 0;
  console.log("activeTab", activeTab);
  console.log("activeSubTab", activeSubTab);
  console.log("tabHasSubTabs", tabHasSubTabs);
  console.log(subTabsMap[activeTab]);

  if (isLoading) {
    return (
      <div className="flex h-full justify-center">
        <LoadingIndicator size={60} />
      </div>
    );
  }
  if (!data || data?.length == 0) {
    return (
      <div className="flex h-full max-w-[66%] items-center justify-center text-center">
        <p>{emptyTabMessageMap[activeTab]}</p>
      </div>
    );
  }

  return (
    <>
      {tabHasSubTabs && (
        <div className="border-x-1 absolute left-1/2 top-0 z-10 mx-10 flex w-[calc(100%-20px)] -translate-x-1/2 items-end justify-around rounded-b-sm border-b-[1px] border-primary bg-background py-[6px]">
          {subTabsMap[activeTab].map((subTab) => {
            console.log("hi");
            return (
              <button
                key={subTab}
                className={cn(
                  "whitespace-nowrap text-base transition-colors hover:text-foreground",
                  subTab === activeSubTab ? "text-foreground" : "text-muted-foreground",
                )}
                onClick={() => setActiveSubTab(subTab)}
              >
                {subTab}
              </button>
            );
          })}
        </div>
      )}
      {/* {tabContentMap[activeTab]} */}
    </>
  );
};

export default SearchTabContent;
