import SearchBar from "@/components/interactive/Search/SearchBar";
import SearchQueries from "@/components/interactive/Search/SearchQueries";
import SearchTabContent from "@/components/interactive/Search/SearchTabs/SearchTabContent";
import { useActiveSearchTabStore } from "@/hooks/stores/useActiveSearchTab";
import useQueryBehavior from "@/hooks/useQueryBehavior";
import { AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
const SearchTabBar = dynamic(
  () => import("@/components/interactive/Search/SearchTabs/SearchTabBar"),
  {
    ssr: false,
  },
);
const SearchResults = dynamic(
  () => import("@/components/interactive/Search/SearchResults/SearchResults"),
  {
    ssr: false,
  },
);

export const Home: NextPage = () => {
  const { showQueries, searchBarRef, searchSettingsRef, searchQueriesRef } = useQueryBehavior();
  const { activeSearchTab, setActiveSearchTab } = useActiveSearchTabStore();

  return (
    <div className="-mt-2 flex min-h-72 w-full max-w-4xl flex-col items-center gap-6 sm:gap-9">
      {/* Search */}
      <div className="flex w-full flex-col items-center gap-5">
        {/* Search Bar */}
        <SearchBar
          ref={searchBarRef}
          searchSettingsRef={searchSettingsRef}
          showResults={showQueries}
        >
          {showQueries && <SearchQueries searchQueriesRef={searchQueriesRef} />}
        </SearchBar>
        {/* Search Tabs */}
        <SearchTabBar activeSearchTab={activeSearchTab} setActiveSearchTab={setActiveSearchTab} />
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeSearchTab !== "" && <SearchTabContent activeSearchTab={activeSearchTab} />}
      </AnimatePresence>

      {/* Results */}
      <SearchResults />
    </div>
  );
};

export default Home;
