import CustomIcon from "@/components/CustomIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { SearchTabVariant } from "./SearchTabBar";

type AccessScopes = "all" | "signed-in-to-spotify" | "signed-in";
const tabAccessMap: Record<SearchTabVariant, AccessScopes> = {
  trending: "all",
  spotify: "signed-in-to-spotify",
  history: "signed-in",
  wishlist: "signed-in",
};

interface SearchTabProps {
  tabVariant: SearchTabVariant;
  activeSearchTab: SearchTabVariant | "";
  setActiveSearchTab: (newTab: SearchTabVariant | "") => void;
}

const SearchTab = ({ tabVariant, activeSearchTab, setActiveSearchTab }: SearchTabProps) => {
  const { data: userData, status: sessionStatus } = useSession();
  const router = useRouterWithHelpers();
  const loggedIn = sessionStatus === "authenticated";
  const { t } = useTranslation("");
  const { data: spotifyAccount } = api.account.getSpotifyAccountById.useQuery(
    { userId: userData?.user.id! },
    {
      enabled: !!userData,
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes to refresh the access token,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  );

  const getTabTranslation = (tab: SearchTabVariant) => t(`search.tabs.${tab}.header`);
  const getTooltipTranslation = (tab: SearchTabVariant) => t(`auth.prompts.${tab}`);
  const isTabEnabled = (tab: SearchTabVariant) => {
    if (tabAccessMap[tab] === "signed-in-to-spotify") return !!spotifyAccount?.data; // If needs to be signed in, enabled if spotify data
    if (tabAccessMap[tab] === "signed-in") return loggedIn; // If needs signed in, enabled if logged in
    return true; // Enabled otherwise
  };

  const handleTabClick = (newTab: SearchTabVariant) => {
    if (newTab === activeSearchTab) {
      setActiveSearchTab("");
      router.setParams({ search: "" });
    } else {
      setActiveSearchTab(newTab);
      router.setParams({ search: newTab });
    }
  };

  return (
    <motion.button
      key={tabVariant}
      onClick={() => handleTabClick(tabVariant)}
      disabled={!isTabEnabled(tabVariant)}
      className={cn(
        "whitespace-nowrap border-b-2 text-foreground transition-all enabled:hover:border-primary/50",
        activeSearchTab === tabVariant ? "!border-primary" : "border-transparent",
      )}
    >
      {!isTabEnabled(tabVariant) && (
        <Tooltip key={tabVariant}>
          <TooltipTrigger className="cursor-not-allowed text-muted-foreground/30">
            <div className="flex items-center gap-2 px-1 pb-1">
              <CustomIcon icon={tabVariant} variant={"primary-muted"} />
              {getTabTranslation(tabVariant)}
            </div>
          </TooltipTrigger>
          <TooltipContent>{getTooltipTranslation(tabVariant)}</TooltipContent>
        </Tooltip>
      )}
      {!!isTabEnabled(tabVariant) && (
        <div className="flex items-center gap-2 px-1 pb-1">
          <CustomIcon icon={tabVariant} variant={"primary"} />
          {getTabTranslation(tabVariant)}
        </div>
      )}
    </motion.button>
  );
};

export default SearchTab;
