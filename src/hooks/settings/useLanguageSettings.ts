import { isLocale, Locale } from "@/helpers/lang";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useUserSettings from "./useUserSettings";

const useLanguageSettings = () => {
  const router = useRouter();
  const { pathname, asPath, query } = router;
  const { status } = useSession();
  const loggedIn = status === "authenticated";
  const { data: sessionData } = useSession();
  const {
    userSettings,
    userSettingsUpdaters: { updatePreferredLanguage },
  } = useUserSettings(sessionData?.user.id);
  const preferredLanguage = userSettings?.language;

  const changeLanguage = async (newLocale: Locale) => {
    if (loggedIn) {
      updatePreferredLanguage?.(newLocale);
    }

    document.cookie = `NEXT_LOCALE=${newLocale}; max-age=31536000; SameSite=Lax; path=/`;
    await router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  // Set language from DB
  useEffect(() => {
    const currentLanguage = router.locale;
    if (preferredLanguage && isLocale(preferredLanguage) && preferredLanguage !== currentLanguage) {
      changeLanguage(preferredLanguage);
    }
  }, [preferredLanguage]);

  return {
    preferredLanguage,
    changeLanguage,
  };
};

export default useLanguageSettings;
