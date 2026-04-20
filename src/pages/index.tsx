import Search from "@/components/interactive/Search/Search";
import SearchTabContent from "@/components/interactive/Search/SearchTabs/SearchTabContent";
import { useActiveSearchTabStore } from "@/hooks/stores/useActiveSearchTab";
import { api } from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
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

interface HomeProps {
  hasInitialId: boolean;
}

export const getServerSideProps: GetServerSideProps<HomeProps> = ({ query }) => ({
  props: { hasInitialId: !!query.id },
});

export const Home: NextPage<HomeProps> = ({ hasInitialId }) => {
  const { activeSearchTab } = useActiveSearchTabStore();
  const router = useRouter();
  // Use the server-detected value until the router hydrates to avoid a flash
  const hasId = router.isReady ? !!router.query.id : hasInitialId;

  const { data: publicStats } = api.stats.getPublicStats.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const showCounter = !!publicStats && publicStats.todaySearches >= 50;

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

        {/* Social proof counter — only shown once daily searches reach 50 */}
        {showCounter && (
          <div className="-mt-6 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <p className="text-xs text-foreground">
              {publicStats.todaySearches.toLocaleString()} tracks compared today
            </p>
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeSearchTab !== "" && <SearchTabContent activeSearchTab={activeSearchTab} />}
        </AnimatePresence>

        {/* Results */}
        <SongListings />

        {/* SEO body text — hidden whenever ?id is present in the URL */}
        <AnimatePresence>
          {!hasId && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.4 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
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
