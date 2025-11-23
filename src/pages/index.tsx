import Search from "@/components/interactive/Search/Search";
import SearchTabContent from "@/components/interactive/Search/SearchTabs/SearchTabContent";
import { useActiveSearchTabStore } from "@/hooks/stores/useActiveSearchTab";
import { AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import dynamic from "next/dynamic";

const SongListings = dynamic(() => import("@/components/interactive/Results/SongListings"), {
  ssr: false,
});

export const Home: NextPage = () => {
  const { activeSearchTab } = useActiveSearchTabStore();

  return (
    <div className="-mt-2 flex min-h-72 w-full max-w-4xl flex-col items-center gap-10 sm:gap-9">
      {/* Search */}
      <Search />
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeSearchTab !== "" && <SearchTabContent activeSearchTab={activeSearchTab} />}
      </AnimatePresence>

      {/* Results */}
      <SongListings />
    </div>
  );
};

export default Home;
