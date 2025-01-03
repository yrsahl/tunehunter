import SearchBar from "@/components/interactive/Search/SearchBar";
import SearchResults from "@/components/interactive/Search/SearchResults";
import { useSearchDataContext } from "@/contexts/SearchDataContext";
import useSearchBar from "@/hooks/useSearchBar";
import { AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import dynamic from "next/dynamic";
const SearchTabBar = dynamic(() => import("@/components/interactive/Search/SearchTabBar"), {
  ssr: false,
});

export const Home: NextPage = () => {
  const { showResults, searchBarRef, searchSettingsRef } = useSearchBar();
  const { searchData } = useSearchDataContext();

  return (
    <div className="-mt-2 flex min-h-72 w-full max-w-4xl flex-col items-center gap-5">
      <SearchBar ref={searchBarRef} searchSettingsRef={searchSettingsRef} showResults={showResults}>
        <AnimatePresence mode="wait">
          {showResults && searchData && <SearchResults searchData={searchData} />}
        </AnimatePresence>
      </SearchBar>
      <SearchTabBar />
    </div>
  );
};

export default Home;
