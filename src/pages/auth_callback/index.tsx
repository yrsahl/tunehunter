import { RedirectIndicator } from "@/components/Indicators";
import { useSpotifyContext } from "@/contexts/SpotifyContext";
import { playJingle } from "@/helpers/play-jingle";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { api } from "@/utils/api";
import type { GetStaticProps, NextPage } from "next";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import nextI18nConfig from "../../../next-i18next.config.mjs";

const AuthCallbackPage: NextPage = ({}) => {
  const router = useRouterWithHelpers();
  const { t } = useTranslation();
  const { data: userData, status } = useSession();
  const { spotifyUserData } = useSpotifyContext();
  const [error, setError] = useState<string | null>(null);
  const loggedIn = status === "authenticated";

  const { data: spotifyAccountData, isLoading: isSpotifyAccountDataLoading } =
    api.account.getSpotifyAccountById.useQuery(
      { userId: userData?.user.id! },
      {
        refetchOnWindowFocus: false,
        enabled: !!userData,
      },
    );
  const accessToken = spotifyAccountData?.data?.access_token;

  useEffect(() => {
    if (!router.isReady) return;
    if (!loggedIn) {
      // setError("You're not logged in!");
      return;
    }
    if (isSpotifyAccountDataLoading || !spotifyUserData) {
      // setError("We're still loading your Spotify account data.");
      return;
    }
    if (!accessToken) {
      // setError(
      //   "We did not receive an API key from Spotify to query your data. Did you allow us to read your data?",
      // );
      return;
    }

    const redirectPath = router.query.redirectPath as string;
    const actionParam = router.getParams("action");

    // Toast
    if (actionParam === "link") {
      toast.success(
        t("toast.connect.success", { account: spotifyUserData?.profileData?.display_name }),
        { duration: 1800 },
      );
    } else {
      toast.success(t("toast.login.success"), { duration: 1800 });
    }

    // Redirect
    playJingle("normal");
    setTimeout(() => {
      router.push(redirectPath);
    }, 2000);
  }, [router.isReady, loggedIn, isSpotifyAccountDataLoading, spotifyUserData, accessToken]);

  return (
    <>
      {!error && (
        <div className="flex items-baseline gap-2">
          <p className="text-lg text-foreground">{t("auth.redirecting")}</p>
          <RedirectIndicator size={12} />
        </div>
      )}
      {error && <p>{error}</p>}
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", "common", nextI18nConfig)),
    },
  };
};

export default AuthCallbackPage;
