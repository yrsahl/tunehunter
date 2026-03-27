import CustomIcon from "@/components/CustomIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDisabledTabStore } from "@/hooks/stores/useDisabledTabStore";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { SearchTab } from "./SearchTabBar";

export type AccessScopes = "all" | "signed-in-to-spotify" | "signed-in";
export const tabAccessMap: Record<SearchTab, AccessScopes> = {
  trending: "all",
  playlist: "all",
  history: "signed-in",
  wishlist: "signed-in",
};
const tabTooltipRestrictionMap: Record<SearchTab, string> = {
  trending: "",
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
      refetchInterval: 30 * 60 * 1000,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    },
  );

  const isSearchTabEnabled = (searchTab: SearchTab) => {
    if (tabAccessMap[searchTab] === "signed-in-to-spotify") return !!spotifyAccount?.data;
    if (tabAccessMap[searchTab] === "signed-in") return loggedIn;
    return true;
  };
  const isTabEnabled = isSearchTabEnabled(searchTab);
  const isTabActive = activeSearchTab === searchTab;

  const handleTabClick = (newSearchTab: SearchTab) => {
    if (!isTabEnabled) {
      toast.info(tabTooltipRestrictionMap[newSearchTab]);
      return;
    }
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
            className={cn(
              "whitespace-nowrap border-b-2 text-sm text-foreground transition-all sm:text-base",
              isTabActive ? "!border-primary" : "border-transparent",
              isTabEnabled ? "hover:border-primary/50" : "cursor-pointer text-muted-foreground/30",
            )}
          >
            <div className="flex items-center gap-2 px-1 pb-1">
              <CustomIcon icon={searchTab} variant={isTabEnabled ? "primary" : "primary-muted"} className="pointer-events-none" />
              <span className="pointer-events-none capitalize">{searchTab}</span>
            </div>
          </motion.button>
        </div>
      </TooltipTrigger>
      {!isTabEnabled && (
        <TooltipContent className="border-foreground/30 bg-background text-foreground">
          {tabTooltipRestrictionMap[searchTab]}
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export default SearchTabButton;
