import useDeviceSize from "@/hooks/useDeviceSize";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { useEffect } from "react";
import SearchTabButton from "./SearchTabButton";

// Tabs
export const searchTabs = ["trending", "spotify", "playlist", "history", "wishlist"] as const;
export type SearchTab = (typeof searchTabs)[number];
export const isSearchTab = (value: string): value is SearchTab =>
  searchTabs.includes(value as SearchTab);

interface SearchTabBarProps {
  activeSearchTab: SearchTab | "";
  setActiveSearchTab: (tab: SearchTab | "") => void;
}

const SearchTabBar = ({ activeSearchTab, setActiveSearchTab }: SearchTabBarProps) => {
  const router = useRouterWithHelpers();
  const { isMobileDevice } = useDeviceSize();

  // Restore active tab if param is present
  useEffect(() => {
    if (!router.isReady) return;
    const searchParam = router.getParams("search");
    if (router.isReady && searchParam && isSearchTab(searchParam)) {
      setActiveSearchTab(searchParam);
    } else {
      setActiveSearchTab("");
    }
  }, [router.isReady, router.query]);

  if (isMobileDevice) {
    return (
      <div className="hide-scrollbars flex w-full min-w-0 flex-nowrap items-start gap-4 overflow-scroll">
        {searchTabs.map((searchTab) => (
          <SearchTabButton
            searchTab={searchTab}
            activeSearchTab={activeSearchTab}
            setActiveSearchTab={setActiveSearchTab}
            key={searchTab}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-wrap justify-center gap-4 overflow-hidden sm:self-auto">
      {searchTabs.map((searchTab) => (
        <SearchTabButton
          searchTab={searchTab}
          activeSearchTab={activeSearchTab}
          setActiveSearchTab={setActiveSearchTab}
          key={searchTab}
        />
      ))}
    </div>
  );
};

export default SearchTabBar;
