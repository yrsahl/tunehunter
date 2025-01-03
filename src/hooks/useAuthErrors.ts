import { isNextAuthError, NextAuthError } from "@/helpers/nextauth-errors";
import { useEffect, useState } from "react";
import useRouterWithHelpers from "./useRouterWithHelpers";

const AuthErrorLoginMap: Record<NextAuthError, string> = {
  OAuthSignin: "",
  OAuthCallback: "",
  OAuthCreateAccount: "",
  EmailCreateAccount: "",
  Callback: "",
  OAuthAccountNotLinked:
    "We could not log you in with the Spotify account because an account with the same mail exists on our platform. Please instead log in to your account using your mail and connect your Spotify account thereafter!",
  EmailSignin: "",
  CredentialsSignin: "",
  SessionRequired: "",
  Default: "",
};
const AuthErrorLinkMap: Record<NextAuthError, string> = {
  OAuthSignin: "",
  OAuthCallback: "",
  OAuthCreateAccount: "",
  EmailCreateAccount: "",
  Callback: "",
  OAuthAccountNotLinked:
    "The Spotify Account you're currently logged in on Spotify's Web Platform is already linked to another account on our platform. Please unlink it first or try another one!",
  EmailSignin: "",
  CredentialsSignin: "",
  SessionRequired: "",
  Default: "",
};

// If a type is specified, the error message will be more specific depending on which context we're in.
const useAuthError = (type?: "login" | "link") => {
  const router = useRouterWithHelpers();
  const [authError, setAuthError] = useState<string | null>(null);

  const getNextAuthErrorText = (authError: NextAuthError) => {
    const authErrorMap = type === "login" ? AuthErrorLoginMap : AuthErrorLinkMap;
    return authErrorMap[authError];
  };

  // Check for errors in URL
  useEffect(() => {
    const errorParams = router.getParams("error");
    if (!errorParams) return;

    if (isNextAuthError(errorParams)) {
      const errorText = getNextAuthErrorText(errorParams);
      setAuthError(errorText);
    }
  }, [router.isReady]);

  return authError;
};

export default useAuthError;
