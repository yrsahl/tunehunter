import Search from "@/components/interactive/Search/Search";
import SearchTabContent from "@/components/interactive/Search/SearchTabs/SearchTabContent";
import { useActiveSearchTabStore } from "@/hooks/stores/useActiveSearchTab";
import { AnimatePresence } from "motion/react";
import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TuneHunter",
  url: "https://tunehunter.app",
  description:
    "Search Beatport, Bandcamp, iTunes & Amazon at once. Find where to buy any track in seconds.",
  applicationCategory: "MusicApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const SongListings = dynamic(() => import("@/components/interactive/Results/SongListings"), {
  ssr: false,
});

export const Home: NextPage = () => {
  const { activeSearchTab } = useActiveSearchTabStore();

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <div className="-mt-2 flex min-h-72 w-full max-w-4xl flex-col items-center gap-9">
        {/* Search */}
        <Search />
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeSearchTab !== "" && <SearchTabContent activeSearchTab={activeSearchTab} />}
        </AnimatePresence>

        {/* Results */}
        <SongListings />
      </div>
    </>
  );
};

export default Home;
