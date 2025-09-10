import { signIn } from "next-auth/react";

type LoginType = "login" | "link";

// Takes the URL and removes the locale (/de) and profile parameter (?profile) from it
export const buildRedirectPath = () => {
  const url = new URL(window.location.href);

  // Remove locale from URL (-> prevent mismatches between DB query and hard-coded redirect-path before login)
  const locale = url.pathname.slice(1, 3);
  if (locale === "de" || locale === "es") {
    url.pathname = url.pathname.slice(3);
  }

  /**
   * Remove the following parameters
   * - profile: close profile menu after redirect
   * - callbackUrl: only present if the prior callback hasn't worked -> no need to double in the next one
   * - error: only present if something went wrong -> no need to double in the next one
   * - disableAnimation: only present if something went wrong -> no need to double in the next one
   */
  const params = new URLSearchParams(url.search);
  params.delete("profile");
  params.delete("callbackUrl");
  params.delete("error");
  params.delete("disableAnimation");
  url.search = params.toString();

  // Put back together
  const redirectPath = url.pathname + url.search;
  return redirectPath;
};

export const signInWithProvider = async (
  providerId: string,
  locale: string,
  type: LoginType = "login",
) => {
  const redirectPath = buildRedirectPath();
  const callbackUrl = `/${locale}/auth_callback/?redirectPath=${redirectPath}${type && `&action=${type}`}`; // Normally go to
  await signIn(providerId, { callbackUrl });
};
