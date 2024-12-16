import {
  countryNamesEnglish,
  countryNamesGerman,
  countryNamesSpanish,
  isRegion,
  Region,
  Regions,
  sortRegions,
} from "@/helpers/region";
import { getUserLocation } from "@/helpers/user-location";
import { iso1A2Code } from "@rapideditor/country-coder"; // ESM import named
import { useLocalStorage } from "@uidotdev/usehooks";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "sonner";
import useUserSettings from "./useUserSettings";

// Uses local storage + DB strategy to faciliate both guests and users to use the setting:
// - If guest: use local storage
// - If user: use DB and local storage for optimistic updates, then reinstate local storage from DB on refresh/page load

const useRegionSettings = () => {
  const router = useRouter();
  const { t } = useTranslation("");
  const [region, setRegion] = useLocalStorage("region", "de");
  const { status, data: userData } = useSession();
  const loggedIn = status === "authenticated";
  const {
    userSettings,
    userSettingsUpdaters: { updatePreferredRegion },
  } = useUserSettings(userData?.user.id);

  const sortedRegions = sortRegions(Regions, router.locale || "en");

  // Set region from DB
  useEffect(() => {
    const preferredRegion = userSettings?.region;
    if (preferredRegion && isRegion(preferredRegion) && preferredRegion !== region) {
      changeRegion(preferredRegion);
    }
  }, [userSettings]);

  const changeRegion = (newRegion: Region) => {
    if (loggedIn) {
      updatePreferredRegion?.(newRegion);
    }
    setRegion(newRegion);
  };

  const createRegionName = (region: string) => {
    if (router.locale === "de") return countryNamesGerman[region];
    if (router.locale === "es") return countryNamesSpanish[region];
    return countryNamesEnglish[region];
  };

  const setRegionByLocation = () => {
    getUserLocation().then((location) => {
      if ("error" in location) {
        toast.error(t("toast.retrieveLocation.error"), { dismissible: true, duration: Infinity });
        return;
      }

      const { latitude, longitude } = location;
      const countryCode = iso1A2Code([longitude, latitude]);
      if (countryCode) {
        changeRegion(countryCode.toLowerCase());
        toast.success(
          t("toast.retrieveLocation.success", { country: createRegionName(countryCode) }),
        );
      } else {
        toast.error(t("toast.retrieveLocation.error"), { dismissible: true, duration: Infinity });
      }
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
