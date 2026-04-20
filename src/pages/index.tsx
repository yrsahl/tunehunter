import Search from "@/components/interactive/Search/Search";
import SearchTabContent from "@/components/interactive/Search/SearchTabs/SearchTabContent";
import { useActiveSearchTabStore } from "@/hooks/stores/useActiveSearchTab";
import useSearchStore from "@/hooks/stores/useSearchStore";
import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TuneHunter",
  url: "https://tunehunter.app",
  description:
    "Compare music download prices across Beatport, Bandcamp, iTunes & Amazon in one search. Find the cheapest place to buy any track online.",
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
  const { searchState } = useSearchStore();
  const hasActiveSearch = !!searchState.id;
  const { data: publicStats } = api.stats.getPublicStats.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const counterText =
    publicStats && publicStats.todaySearches > 0
      ? `${publicStats.todaySearches.toLocaleString()} tracks compared today`
      : "Comparing prices across 4 stores";

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

        {/* Social proof counter */}
        <div className="-mt-6 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <p className="text-xs text-foreground">{counterText}</p>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeSearchTab !== "" && <SearchTabContent activeSearchTab={activeSearchTab} />}
        </AnimatePresence>

        {/* Results */}
        <SongListings />

        {/* SEO body text — only shown when no track is selected */}
        <AnimatePresence>
          {!hasActiveSearch && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full space-y-4 pb-6 text-center text-sm leading-relaxed text-foreground"
            >
              <p>
                TuneHunter lets you compare music download prices across all major stores in a
                single search — no more jumping between tabs to find the best deal. Search once,
                see every price, buy where it makes sense.
              </p>
              <p>
                Whether you are a DJ hunting for the perfect track on Beatport, a collector
                browsing Bandcamp for exclusive releases, or just looking for the cheapest place
                to buy songs online, TuneHunter searches Beatport, Bandcamp, iTunes, and Amazon
                at once and shows you every available price side by side.
              </p>
              <p>
                Free to use, no account required. Start comparing music download prices now —
                just type an artist or track name above.
              </p>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Home;
