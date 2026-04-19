import Search from "@/components/interactive/Search/Search";
import SearchTabContent from "@/components/interactive/Search/SearchTabs/SearchTabContent";
import { useActiveSearchTabStore } from "@/hooks/stores/useActiveSearchTab";
import { api } from "@/lib/api";
import { AnimatePresence } from "framer-motion";
import { BadgeDollarSign, ShoppingCart, Zap } from "lucide-react";
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

        {/* SEO section */}
        <section className="w-full max-w-xl space-y-4 pb-6 text-center text-xs text-foreground">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5 text-primary" />
              <span>Beatport, Bandcamp, iTunes &amp; Amazon</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BadgeDollarSign className="h-3.5 w-3.5 text-primary" />
              <span>Compare prices instantly</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>Free · No account needed</span>
            </div>
          </div>
          <p className="leading-relaxed">
            The fastest way to find the cheapest place to buy any track online — search once,
            see every price, buy where it makes sense.
          </p>
        </section>
      </div>
    </>
  );
};

export default Home;
