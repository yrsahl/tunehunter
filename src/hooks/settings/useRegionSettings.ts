import {
  CountryCode,
  CountryCodes,
  countryNamesEnglish,
  countryNamesGerman,
  countryNamesSpanish,
  isCountryCode,
  sortRegions,
} from "@/helpers/region";
import { getUserLocation } from "@/helpers/user-location";
import { iso1A2Code } from "@rapideditor/country-coder"; // ESM import named
import { useLocalStorage } from "@uidotdev/usehooks";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "sonner";
import useUserSettings from "./useUserSettings";

// Uses local storage + DB strategy to faciliate both guests and users to use the setting:
// - If guest: use local storage
// - If user: use DB and local storage for optimistic updates, then reinstate local storage from DB on refresh/page load

const useRegionSettings = () => {
  const router = useRouter();
  const [region, setRegion] = useLocalStorage("region", "de");
  const { status, data: userData } = useSession();
  const loggedIn = status === "authenticated";
  const {
    userSettings,
    userSettingsUpdaters: { updatePreferredRegion },
  } = useUserSettings(userData?.user.id);

  const sortedRegions = sortRegions(CountryCodes, router.locale || "en");

  // Set region from DB
  useEffect(() => {
    const preferredRegion = userSettings?.region;
    if (preferredRegion && isCountryCode(preferredRegion) && preferredRegion !== region) {
      changeRegion(preferredRegion);
    }
  }, [userSettings]);

  const changeRegion = (country: CountryCode) => {
    if (loggedIn) {
      updatePreferredRegion?.(country);
      toast.success(`Changed your Region to ${createCountryName(country.toUpperCase())}!`);
    }
    setRegion(country);
  };

  const createCountryName = (country: CountryCode) => {
    if (router.locale === "de") return countryNamesGerman[country];
    if (router.locale === "es") return countryNamesSpanish[country];
    return countryNamesEnglish[country];
  };

  const setRegionByLocation = () => {
    toast.loading("Determining your location...");
    getUserLocation().then((location) => {
      toast.dismiss();
      if ("error" in location) {
        toast.error(
          "We could not determine your location. Please choose it manually or try again later!",
          { dismissible: true, duration: Infinity },
        );
        return;
      }

      const { latitude, longitude } = location;
      const countryCode = iso1A2Code([longitude, latitude]);
      if (countryCode) {
        changeRegion(countryCode.toLowerCase());
      } else {
        toast.error(
          "We could not determine your location. Please choose it manually or try again later!",
          { dismissible: true, duration: Infinity },
        );
      }
    });
  };

  return {
    region,
    changeRegion,
    createRegionName: createCountryName,
    setRegionByLocation,
    sortedRegions,
  };
};

export default useRegionSettings;
