import CustomIcon from "@/components/CustomIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDisabledTabStore } from "@/hooks/stores/useDisabledTabStore";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import type { SearchTab } from "./SearchTabBar";

type AccessScopes = "all" | "signed-in-to-spotify" | "signed-in";
const tabAccessMap: Record<SearchTab, AccessScopes> = {
  trending: "all",
  playlist: "all",
  history: "signed-in",
  wishlist: "signed-in",
};
const tabTooltipRestrictionMap: Record<SearchTab, string> = {
  trending: "", // Always accessible
  playlist: "",
  wishlist: "Sign in to view your wishlist!",
  history: "Sign in to view your history!",
};

interface SearchTabButtonProps {
  searchTab: SearchTab;
  activeSearchTab: SearchTab | "";
  setActiveSearchTab: (newTab: SearchTab | "") => void;
}

const SearchTabButton = ({
  searchTab,
  activeSearchTab,
  setActiveSearchTab,
}: SearchTabButtonProps) => {
  const { data: userData, status: sessionStatus } = useSession();
  const router = useRouterWithHelpers();
  const loggedIn = sessionStatus === "authenticated";
  const { setDisabledTabButtonHovered } = useDisabledTabStore();
  const { data: spotifyAccount } = api.account.getSpotifyAccountById.useQuery(
    { userId: userData?.user.id! },
    {
      enabled: loggedIn,
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes to refresh the access token,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  );

  const isSearchTabEnabled = (searchTab: SearchTab) => {
    if (tabAccessMap[searchTab] === "signed-in-to-spotify") return !!spotifyAccount?.data; // If needs to be signed in, enabled if spotify data
    if (tabAccessMap[searchTab] === "signed-in") return loggedIn; // If needs signed in, enabled if logged in
    return true; // Enabled otherwise
  };
  const isTabEnabled = isSearchTabEnabled(searchTab);
  const isTabActive = activeSearchTab === searchTab;

  const handleTabClick = (newSearchTab: SearchTab) => {
    if (newSearchTab === activeSearchTab) {
      setActiveSearchTab("");
      router.setParams({ search: "" });
    } else {
      setActiveSearchTab(newSearchTab);
      router.setParams({ search: newSearchTab });
    }
  };

  return (
    <Tooltip key={searchTab}>
      <TooltipTrigger asChild>
        <div
          onMouseEnter={() => !isTabEnabled && setDisabledTabButtonHovered(true)}
          onMouseLeave={() => setDisabledTabButtonHovered(false)}
        >
          <motion.button
            key={searchTab}
            onClick={() => handleTabClick(searchTab)}
            disabled={!isTabEnabled}
            className={cn(
              "whitespace-nowrap border-b-2 text-sm text-foreground transition-all enabled:hover:border-primary/50 sm:text-base",
              isTabActive ? "!border-primary" : "border-transparent",
              !isTabEnabled && "cursor-not-allowed text-muted-foreground/30",
            )}
          >
            <div className="flex items-center gap-2 px-1 pb-1">
              <CustomIcon icon={searchTab} variant={isTabEnabled ? "primary" : "primary-muted"} />
              <span className="capitalize">{searchTab}</span>
            </div>
            {!isTabEnabled && (
              <TooltipContent className="border-foreground/30 bg-background text-foreground">
                {tabTooltipRestrictionMap[searchTab]}
              </TooltipContent>
            )}
          </motion.button>
        </div>
      </TooltipTrigger>
    </Tooltip>
  );
};

export default SearchTabButton;
