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

        {/* SEO feature section */}
        <section className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card/70 text-sm">
          <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-start gap-3 px-5 py-4 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
              <ShoppingCart className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0" />
              <div>
                <p className="font-semibold text-foreground">4 stores at once</p>
                <p className="mt-0.5 text-xs text-foreground">
                  Beatport, Bandcamp, iTunes & Amazon — searched simultaneously
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-5 py-4 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
              <BadgeDollarSign className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0" />
              <div>
                <p className="font-semibold text-foreground">Compare prices</p>
                <p className="mt-0.5 text-xs text-foreground">
                  Find the cheapest place to buy any track online without tab-hopping
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-5 py-4 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
              <Zap className="mt-0.5 h-5 w-5 shrink-0 text-primary sm:mt-0" />
              <div>
                <p className="font-semibold text-foreground">Free &amp; instant</p>
                <p className="mt-0.5 text-xs text-foreground">
                  No account needed — results in seconds for DJs and collectors alike
                </p>
              </div>
            </div>
          </div>
          <p className="border-t border-border px-5 py-3 text-center text-xs text-foreground">
            TuneHunter is the easiest way to compare music download prices across every major
            store. Search once, see every price, buy where it makes sense.
          </p>
        </section>
      </div>
    </>
  );
};

export default Home;
