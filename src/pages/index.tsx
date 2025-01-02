import SearchBar from "@/components/interactive/Search/SearchBar";
import SearchResults from "@/components/interactive/Search/SearchResults";
import { useSearchDataContext } from "@/contexts/SearchDataContext";
import useSearchBar from "@/hooks/useSearchBar";
import { AnimatePresence } from "framer-motion";
import type { GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import dynamic from "next/dynamic";
import nextI18nConfig from "../../next-i18next.config.mjs";
const SearchTabs = dynamic(() => import("@/components/interactive/Search/SearchTabBar"), {
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
