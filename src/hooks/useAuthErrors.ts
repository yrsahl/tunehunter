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
    "An account with the same email address already exists. Please login via email instead.",
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
  OAuthAccountNotLinked: "The Spotify account is already linked to another account.",
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
