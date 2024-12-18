import SearchBar from "@/components/interactive/Search/SearchBar";
import SearchResults from "@/components/interactive/Search/SearchResults";
import useSearch from "@/hooks/useSearch";
import { AnimatePresence } from "framer-motion";
import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import nextI18nConfig from "../../next-i18next.config.mjs";
const SearchTabs = dynamic(() => import("@/components/interactive/Search/SearchTabs"), {
  ssr: false,
});

export const Home: NextPage = () => {
  const {
    searchInput,
    searchData,
    isSearchDataLoading,
    handleSearchSubmit,
    handleInputChange,
    resetSearch,
  } = useSearch();

  const [showResults, setShowResults] = useState(false);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const handleClickSearchBar = (event: MouseEvent) => {
    if (!searchBarRef.current) return; // No ref

    if (searchBarRef.current.contains(event.target as Node)) setShowResults(true);
    if (!searchBarRef.current.contains(event.target as Node)) setShowResults(false);
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickSearchBar);
    return () => {
      document.removeEventListener("mousedown", handleClickSearchBar);
    };
  }, []);

  return (
    <div className="-mt-2 flex min-h-72 w-full max-w-4xl flex-col items-center gap-5">
      <SearchBar
        ref={searchBarRef}
        searchInput={searchInput}
        searchData={searchData}
        isSearchDataLoading={isSearchDataLoading}
        handleSearchSubmit={handleSearchSubmit}
        handleInputChange={handleInputChange}
        showResults={showResults}
        resetSearch={resetSearch}
      >
        <AnimatePresence mode="wait">
          {showResults && searchData && <SearchResults searchData={searchData} />}
        </AnimatePresence>
      </SearchBar>
      <SearchTabs />
    </div>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", "common", nextI18nConfig)),
    },
  };
};

export default Home;
