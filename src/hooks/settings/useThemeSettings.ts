import { fetchDayTimeStatus } from "@/helpers/sunrise";
import { getUserLocation, UserLocation } from "@/helpers/user-location";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import useUserSettings from "./useUserSettings";

export const AutoThemePreferences = ["auto", "manual"] as const;
export type AutoThemePreference = (typeof AutoThemePreferences)[number];

// Uses DB for storage as it's a user-only setting

const useThemeSettings = () => {
  const { resolvedTheme, setTheme } = useTheme(); // Next hook
  const { status, data: userData } = useSession();
  const loggedIn = status === "authenticated";
  const {
    userSettings,
    userSettingsUpdaters: { updatePreferredTheme },
  } = useUserSettings(userData?.user.id);
  const preferredTheme = userSettings?.theme;

  // Set theme from DB
  useEffect(() => {
    // Theme variable set?
    if (!preferredTheme) return;
    // Desired theme already active?
    if (preferredTheme === resolvedTheme) return;

    switch (preferredTheme) {
      case "light":
        setTheme("light");
        break;
      case "dark":
        setTheme("dark");
        break;
      case "auto":
        getUserLocation().then((userLocation) => {
          if ("error" in userLocation) {
            return;
          }
          setThemeByDaytime(userLocation);
        });
        break;
    }
  }, [preferredTheme]);

  const setThemeByDaytime = async (userLocation: UserLocation) => {
    const isDaytime = await fetchDayTimeStatus(userLocation);

    if (isDaytime) setTheme("light");
    else setTheme("dark");
  };

  const changeTheme = () => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (loggedIn) updatePreferredTheme?.(newTheme);
  };

  const changeAutoThemePreference = (autoThemePreference: AutoThemePreference) => {
    if (autoThemePreference === "auto") updatePreferredTheme("auto");
    else {
      const currentTheme = resolvedTheme === "light" ? "light" : "dark";
      updatePreferredTheme(currentTheme);
    }
  };

  return {
    preferredTheme,
    changeTheme,
    changeAutoThemePreference,
  };
};

export default useThemeSettings;
