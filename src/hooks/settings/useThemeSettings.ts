import { fetchDayTimeStatus } from "@/helpers/sunrise";
import { getUserLocation, UserLocation } from "@/helpers/user-location";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import useUserSettings from "./useUserSettings";

export const AutoThemePreferences = ["Automatically", "Manually"];

// Uses DB for storage as it's a user only-setting

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

    if (preferredTheme === "light") setTheme("light");
    if (preferredTheme === "dark") setTheme("dark");
    if (preferredTheme === "auto") {
      getUserLocation().then((userLocation) => {
        if ("error" in userLocation) {
          return;
        }
        setThemeByDaytime(userLocation);
      });
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

  const changeAutoThemePreference = async (checked: boolean) => {
    if (checked) {
      updatePreferredTheme("auto"); // Db
    } else {
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
