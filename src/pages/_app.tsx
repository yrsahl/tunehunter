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
import { SpotifyPlayerProvider } from "@/contexts/SpotifyPlayerContext";
import { SpotifyUserDataProvider } from "@/contexts/SpotifyUserDataContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { DefaultSeo } from "next-seo";
import SEO from "../../next-seo.config";

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
        <meta name="apple-mobile-web-app-title" content="TrackScout" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <DefaultSeo {...SEO} />
      <Toaster position="top-right" toastOptions={toastOptions} closeButton richColors />
      <SpeedInsights />
      <Analytics />
      <SessionProvider session={session}>
        <SpotifyUserDataProvider>
          <SpotifyPlayerProvider>
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
          </SpotifyPlayerProvider>
        </SpotifyUserDataProvider>
      </SessionProvider>
    </>
  );
};

const TRPCApp = api.withTRPC(MyApp);

export default TRPCApp;
