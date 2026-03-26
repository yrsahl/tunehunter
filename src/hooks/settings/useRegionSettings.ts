import { getUserLocation } from "@/lib/browser";
import {
  CountryCode,
  CountryCodes,
  getCountryName,
  isCountryCode,
  sortRegions,
} from "@/lib/validators";
import { iso1A2Code } from "@rapideditor/country-coder"; // ESM import named
import { useLocalStorage } from "@uidotdev/usehooks";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import useUserSettings from "./useUserSettings";

// Uses local storage + DB strategy to faciliate both guests and users to use the setting:
// - If guest: use local storage
// - If user: use DB and local storage for optimistic updates, then reinstate local storage from DB on refresh/page load

const useRegionSettings = () => {
  const hasStoredRegion = useRef(
    typeof window !== "undefined" && window.localStorage.getItem("region") !== null,
  );
  const [region, setRegion] = useLocalStorage<CountryCode>("region", "US");
  const { status, data: userData } = useSession();
  const loggedIn = status === "authenticated";
  const {
    userSettings,
    userSettingsUpdaters: { updatePreferredRegion },
  } = useUserSettings(userData?.user.id);

  const sortedRegions = sortRegions(CountryCodes);

  // Auto-detect region from browser locale on first visit
  useEffect(() => {
    if (hasStoredRegion.current) return;
    for (const locale of navigator.languages) {
      const parts = locale.split("-");
      const countryTag = (parts.length > 1 ? parts[parts.length - 1] : parts[0])!.toUpperCase();
      if (isCountryCode(countryTag)) {
        setRegion(countryTag);
        break;
      }
    }
  }, []);

  // Set region from DB
  useEffect(() => {
    const preferredRegion = userSettings?.region;
    if (preferredRegion && isCountryCode(preferredRegion) && preferredRegion !== region) {
      changeRegion(preferredRegion);
    }
  }, [userSettings]);

  const changeRegion = (country: CountryCode) => {
    // If logged in, update DB
    if (loggedIn) {
      updatePreferredRegion?.(country);
    }
    // Update local storage
    setRegion(country);
  };

  const createRegionName = (country: CountryCode) => getCountryName(country);

  const setRegionByLocation = () => {
    const locationPromise = new Promise<string>((resolve, reject) => {
      getUserLocation().then((location) => {
        if ("error" in location) {
          reject(new Error("We could not determine your location. Please choose it manually or try again later!"));
          return;
        }

        const { latitude, longitude } = location;
        const countryCode = iso1A2Code([longitude, latitude])?.toLowerCase();
        const upper = countryCode?.toUpperCase();
        if (upper && isCountryCode(upper)) {
          if (countryCode !== region) changeRegion(upper);
          resolve(getCountryName(upper) ?? upper);
        } else {
          reject(new Error("Could not determine your location."));
        }
      });
    });

    toast.promise(locationPromise, {
      loading: "Determining your location...",
      success: (countryName) => `Set your region to ${countryName}.`,
      error: (err: unknown) => err instanceof Error ? err.message : "Could not determine your location.",
    });
  };

  return {
    region,
    changeRegion,
    createRegionName,
    setRegionByLocation,
    sortedRegions,
  };
};

export default useRegionSettings;
