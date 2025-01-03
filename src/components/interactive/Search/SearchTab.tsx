import CustomIcon from "@/components/CustomIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import type { Tab } from "./SearchTabBar";

type AccessScopes = "all" | "signed-in-to-spotify" | "signed-in";
const tabAccessMap: Record<Tab, AccessScopes> = {
  trending: "all",
  spotify: "signed-in-to-spotify",
  history: "signed-in",
  wishlist: "signed-in",
};
const tabTooltipRestrictionMap: Record<Tab, string> = {
  trending: "", // Always accessible
  spotify: "Create an account or Sign In to view your Spotify songs!",
  wishlist: "Create an account or Sign In to view your Wishlist!",
  history: "Create an account or Sign In to view your History!",
};

interface SearchTabProps {
  searchTab: Tab;
  activeSearchTab: Tab | "";
  setActiveSearchTab: (newTab: Tab | "") => void;
}

const SearchTab = ({ searchTab, activeSearchTab, setActiveSearchTab }: SearchTabProps) => {
  const { data: userData, status: sessionStatus } = useSession();
  const router = useRouterWithHelpers();
  const loggedIn = sessionStatus === "authenticated";
  const { data: spotifyAccount } = api.account.getSpotifyAccountById.useQuery(
    { userId: userData?.user.id! },
    {
      enabled: !!userData,
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes to refresh the access token,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  );

  const isTabEnabled = (tab: Tab) => {
    if (tabAccessMap[tab] === "signed-in-to-spotify") return !!spotifyAccount?.data; // If needs to be signed in, enabled if spotify data
    if (tabAccessMap[tab] === "signed-in") return loggedIn; // If needs signed in, enabled if logged in
    return true; // Enabled otherwise
  };

  const handleTabClick = (newTab: Tab) => {
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
      key={searchTab}
      onClick={() => handleTabClick(searchTab)}
      disabled={!isTabEnabled(searchTab)}
      className={cn(
        "whitespace-nowrap border-b-2 text-foreground transition-all enabled:hover:border-primary/50",
        activeSearchTab === searchTab ? "!border-primary" : "border-transparent",
      )}
    >
      {!isTabEnabled(searchTab) && (
        <Tooltip key={searchTab}>
          <TooltipTrigger className="cursor-not-allowed text-muted-foreground/30">
            <div className="flex items-center gap-2 px-1 pb-1">
              <CustomIcon icon={searchTab} variant={"primary-muted"} />
              <span className="capitalize">{searchTab}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>{tabTooltipRestrictionMap[searchTab]}</TooltipContent>
        </Tooltip>
      )}
      {!!isTabEnabled(searchTab) && (
        <div className="flex items-center gap-2 px-1 pb-1">
          <CustomIcon icon={searchTab} variant={"primary"} />
          <span className="capitalize">{searchTab}</span>
        </div>
      )}
    </motion.button>
  );
};

export default SearchTab;
