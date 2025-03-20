import SearchBar from "@/components/interactive/Search/SearchBar";
import SearchResults from "@/components/interactive/Search/SearchResults";
import { SearchTab } from "@/components/interactive/Search/SearchTabBar";
import SearchTabContent from "@/components/interactive/Search/SearchTabContent";
import { useSearchDataContext } from "@/contexts/SearchDataContext";
import useSearchBar from "@/hooks/useSearchBar";
import { AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import { useState } from "react";
const SearchTabBar = dynamic(() => import("@/components/interactive/Search/SearchTabBar"), {
  ssr: false,
});

export const Home: NextPage = () => {
  const { showResults, searchBarRef, searchSettingsRef, searchResultsRef } = useSearchBar();
  const { searchData } = useSearchDataContext();
  const [activeSearchTab, setActiveSearchTab] = useState<SearchTab | "">("");

  return (
    <div className="-mt-2 flex min-h-72 w-full max-w-4xl flex-col items-center gap-5">
      <SearchBar ref={searchBarRef} searchSettingsRef={searchSettingsRef} showResults={showResults}>
        <AnimatePresence mode="wait">
          {showResults && searchData && (
            <SearchResults searchData={searchData} searchResultsRef={searchResultsRef} />
          )}
        </AnimatePresence>
      </SearchBar>
      <SearchTabBar activeSearchTab={activeSearchTab} setActiveSearchTab={setActiveSearchTab} />
      <AnimatePresence mode="wait">
        {activeSearchTab !== "" && <SearchTabContent activeSearchTab={activeSearchTab} />}
      </AnimatePresence>
    </div>
  );
};

export default Home;
