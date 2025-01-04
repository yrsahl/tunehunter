import CustomIcon from "@/components/CustomIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import type { SearchTab } from "./SearchTabBar";

type AccessScopes = "all" | "signed-in-to-spotify" | "signed-in";
const tabAccessMap: Record<SearchTab, AccessScopes> = {
  trending: "all",
  spotify: "signed-in-to-spotify",
  history: "signed-in",
  wishlist: "signed-in",
};
const tabTooltipRestrictionMap: Record<SearchTab, string> = {
  trending: "", // Always accessible
  spotify: "Create an account or Sign In to view your Spotify songs!",
  wishlist: "Create an account or Sign In to view your Wishlist!",
  history: "Create an account or Sign In to view your History!",
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
  const { data: spotifyAccount } = api.account.getSpotifyAccountById.useQuery(
    { userId: userData?.user.id! },
    {
      enabled: !!userData,
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
    <motion.button
      key={searchTab}
      onClick={() => handleTabClick(searchTab)}
      disabled={!isSearchTabEnabled(searchTab)}
      className={cn(
        "whitespace-nowrap border-b-2 text-foreground transition-all enabled:hover:border-primary/50",
        activeSearchTab === searchTab ? "!border-primary" : "border-transparent",
      )}
    >
      {!isSearchTabEnabled(searchTab) && (
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
      {!!isSearchTabEnabled(searchTab) && (
        <div className="flex items-center gap-2 px-1 pb-1">
          <CustomIcon icon={searchTab} variant={"primary"} />
          <span className="capitalize">{searchTab}</span>
        </div>
      )}
    </motion.button>
  );
};

export default SearchTabButton;
