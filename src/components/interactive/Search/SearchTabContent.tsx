import { LoadingIndicator } from "@/components/Indicators";
import useTabContentData from "@/hooks/useTabContentData";
import { cn } from "@/lib/utils";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { SearchTabType } from "./SearchTabBar";

const subTabsMap = {
  spotify: ["recentlyPlayed", "queue", "topTracks"],
  trending: [],
  history: ["purchases", "searches"],
  wishlist: [],
};
type SubTab = "topTracks" | "queue" | "recentlyPlayed" | "purchases" | "searches";

interface SearchTabContentProps {
  activeTab: SearchTabType;
}

const SearchTabContent = ({ activeTab }: SearchTabContentProps) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab | "">("");
  const { t } = useTranslation();
  const { data, isLoading } = useTabContentData(activeTab, activeSubTab);

  if (isLoading) {
    return (
      <div className="flex h-full justify-center">
        <LoadingIndicator size={60} />
      </div>
    );
  }
  if (data?.length == 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p>{t(`search.tabs.${activeTab}.empty`)}</p>
      </div>
    );
  }

  return (
    <>
      <div className="border-x-1 absolute left-1/2 top-0 z-10 flex w-full max-w-[450px] -translate-x-1/2 items-center justify-around rounded-b-sm border-b-[1px] border-primary bg-background px-1 py-[6px]">
        {subTabsMap[activeTab].map((subTabVariant) => (
          <button
            key={subTabVariant}
            className={cn(
              "whitespace-nowrap text-base transition-colors hover:text-foreground",
              subTabVariant === activeSubTab ? "text-foreground" : "text-muted-foreground",
            )}
            onClick={() => setActiveSubTab(subTabVariant)}
          >
            {t(`search.tabs.${activeTab}.subTabs.${subTabVariant}.header`)}
          </button>
        ))}
      </div>
      {/* {tabContentMap[activeTab]} */}
    </>
  );
};

export default SearchTabContent;
