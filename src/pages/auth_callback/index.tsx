import { RedirectIndicator } from "@/components/Indicators";
import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { playJingle } from "@/lib/browser";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const AuthCallbackPage: NextPage = ({}) => {
  const router = useRouterWithHelpers();
  const { status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const loggedIn = status === "authenticated";

  // Check for spotify user data
  const { spotifyUserData } = useSpotifyUserDataContext();
  const spotifyAccountName = spotifyUserData?.profileData?.display_name;

  useEffect(() => {
    if (!router.isReady) return;
    if (!loggedIn) return;

    const redirectPath = router.query.redirectPath as string;
    const actionParam = router.getParams("action");

    // For Spotify linking, wait for account data so we can show the account name
    if (actionParam === "link" && !spotifyUserData) return;

    // Toast
    if (actionParam === "link") {
      toast.success(`Spotify account ${spotifyAccountName} successfully linked!`, {
        duration: 1800,
      });
    }
    if (actionParam === "login") {
      toast.success("Successfully logged in.", { duration: 1800 });
    }

    // Redirect
    playJingle("normal");
    setTimeout(() => {
      router.push(redirectPath);
    }, 2000);
  }, [router.isReady, loggedIn, spotifyAccountName]);

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
