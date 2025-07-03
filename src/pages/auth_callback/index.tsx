import { RedirectIndicator } from "@/components/Indicators";
import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import { playJingle } from "@/helpers/play-jingle";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { api } from "@/utils/api";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AuthCallbackPage: NextPage = ({}) => {
  const router = useRouterWithHelpers();
  const { data: userData, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const loggedIn = status === "authenticated";

  // Check for spotify user data
  const { spotifyUserData } = useSpotifyUserDataContext();

  // Check if we got an access key
  const { data: spotifyAccountData, isLoading: isSpotifyAccountDataLoading } =
    api.account.getSpotifyAccountById.useQuery(
      { userId: userData?.user.id! },
      {
        enabled: loggedIn,
        refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes to refresh the access token
        refetchIntervalInBackground: true,
        refetchOnWindowFocus: false,
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
        `Spotify account ${spotifyUserData?.profileData?.display_name} successfully linked!`,
        { duration: 1800 },
      );
    } else {
      toast.success("Successfully logged in.", { duration: 1800 });
    }

    // Redirect
    playJingle("normal");
    setTimeout(() => {
      router.push(redirectPath);
    }, 2000);
  }, [router.isReady, loggedIn, isSpotifyAccountDataLoading, spotifyUserData, accessToken]);

  return (
    // The weird 280px value comes from the min-h-72 from the main page size; however flex calculates the 2rem gap differently in both cases for some reason so I manually adjusted
    <div className="min-h-[280px]">
      {!error && (
        <div className="flex items-baseline gap-2">
          <p className="text-lg text-foreground">Redirecting</p>
          <RedirectIndicator size={12} />
        </div>
      )}
      {error && <p>{error}</p>}
    </div>
  );
};

export default AuthCallbackPage;
