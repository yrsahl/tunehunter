import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import Head from "next/head";

import { api } from "@/lib/api";

import { ThemeProvider } from "@/components/ThemeProvider";
import "@/styles/globals.css";
import Layout from "./layout";

import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryDataProvider } from "@/contexts/QueryDataContext";
import { SearchTabDataProvider } from "@/contexts/SearchTabDataContext";
// [SPOTIFY_OAUTH] Re-enable when Spotify extended quota is approved
// import { SpotifyPlayerProvider } from "@/contexts/SpotifyPlayerContext";
// import { SpotifyUserDataProvider } from "@/contexts/SpotifyUserDataContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { DefaultSeo } from "next-seo";
import SEO from "../../next-seo.config";
import DevOverlay from "@/components/dev/DevOverlay";

const toastOptions = {
  // Figure this out at some later day
  // classNames: {
  //   success: "bg-success text-success-foreground",
  //   error: "bg-error text-error-foreground",
  //   info: "bg-info text-info-foreground",
  //   warning: "bg-warning text-warning-foreground",
  // },
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="TuneHunter" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <DefaultSeo {...SEO} />
      <Toaster position="top-right" toastOptions={toastOptions} closeButton richColors />
      {process.env.NODE_ENV === "development" && <DevOverlay />}
      <Script id="plausible-init" strategy="afterInteractive">{`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}</Script>
      <Script async src="https://plausible.io/js/pa-f7TccdK8oaAAyTMB2n6aH.js" strategy="afterInteractive" />
      <SpeedInsights />
      <Analytics />
      <SessionProvider session={session}>
        {/* [SPOTIFY_OAUTH] Re-wrap with SpotifyUserDataProvider + SpotifyPlayerProvider when quota approved */}
        <TooltipProvider delayDuration={150}>
          <ThemeProvider attribute="class" defaultTheme="auto" enableSystem={false}>
            <Layout>
              <QueryDataProvider>
                <SearchTabDataProvider>
                  <Component {...pageProps} />
                </SearchTabDataProvider>
              </QueryDataProvider>
            </Layout>
          </ThemeProvider>
        </TooltipProvider>
      </SessionProvider>
    </>
  );
};

const TRPCApp = api.withTRPC(MyApp);

export default TRPCApp;
