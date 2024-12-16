import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "@/utils/api";
import { appWithTranslation } from "next-i18next";

import { ThemeProvider } from "@/components/ThemeProvider";
import "@/styles/globals.css";
import nextI18nConfig from "../../next-i18next.config.mjs";
import Layout from "./layout";

import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { SpotifyProvider } from "@/contexts/SpotifyContext";
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
      <DefaultSeo {...SEO} />
      <Toaster position="top-right" toastOptions={toastOptions} closeButton richColors />
      <SessionProvider session={session}>
        <SpotifyProvider>
          <TooltipProvider delayDuration={500}>
            <ThemeProvider attribute="class" defaultTheme="auto" enableSystem={false}>
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ThemeProvider>
          </TooltipProvider>
        </SpotifyProvider>
      </SessionProvider>
    </>
  );
};

const I18nApp = appWithTranslation(MyApp, nextI18nConfig);
const TRPCApp = api.withTRPC(I18nApp);

export default TRPCApp;
