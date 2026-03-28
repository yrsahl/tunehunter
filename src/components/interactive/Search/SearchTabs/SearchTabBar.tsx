import useDeviceSize from "@/hooks/useDeviceSize";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import SearchTabButton, { tabAccessMap } from "./SearchTabButton";

// Tabs
export const searchTabs = ["trending", "favorites", "history", "playlist"] as const;
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
  const { status: sessionStatus } = useSession();
  const loggedIn = sessionStatus === "authenticated";

  // Restore active tab if param is present and user has access
  useEffect(() => {
    if (!router.isReady || sessionStatus === "loading") return;
    const searchParam = router.getParams("search");
    if (searchParam && isSearchTab(searchParam)) {
      const access = tabAccessMap[searchParam];
      const hasAccess = access === "all" || (access === "signed-in" && loggedIn);
      if (hasAccess) {
        setActiveSearchTab(searchParam);
        return;
      }
    }
    setActiveSearchTab("");
  }, [router.isReady, router.query, sessionStatus]);

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
