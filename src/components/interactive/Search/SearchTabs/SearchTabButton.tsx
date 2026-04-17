import CustomIcon from "@/components/CustomIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDisabledTabStore } from "@/hooks/stores/useDisabledTabStore";
import useDeviceSize from "@/hooks/useDeviceSize";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { trackEvent } from "@/lib/plausible";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { SearchTab } from "./SearchTabBar";

export type AccessScopes = "all" | "signed-in-to-spotify" | "signed-in";
export const tabAccessMap: Record<SearchTab, AccessScopes> = {
  trending: "all",
  playlist: "all",
  history: "signed-in",
  favorites: "signed-in",
};

const tabTooltipRestrictionMap: Record<SearchTab, string> = {
  trending: "",
  playlist: "",
  favorites: "Sign in to view your favorites",
  history: "Sign in to view your history",
};

const tabToastRestrictionMap: Record<SearchTab, string> = {
  trending: "",
  playlist: "",
  favorites: "Your favorites require an account.",
  history: "Your history requires an account.",
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
  const { status: sessionStatus } = useSession();
  const router = useRouterWithHelpers();
  const { isSmallDevice } = useDeviceSize();
  const loggedIn = sessionStatus === "authenticated";
  const { setDisabledTabButtonHovered } = useDisabledTabStore();
  const isSearchTabEnabled = (searchTab: SearchTab) => {
    if (tabAccessMap[searchTab] === "signed-in") return loggedIn;
    return true;
  };
  const isTabEnabled = isSearchTabEnabled(searchTab);
  const isTabActive = activeSearchTab === searchTab;

  const handleTabClick = (newSearchTab: SearchTab) => {
    if (!isTabEnabled) {
      if (isSmallDevice) {
        toast.info(tabToastRestrictionMap[newSearchTab], {
          action: { label: "Sign in", onClick: () => router.setParams({ profile: "login" }) },
          classNames: {
            actionButton: "!bg-primary !text-primary-foreground hover:!bg-primary/80",
          },
        });
      }
      return;
    }
    if (newSearchTab === activeSearchTab) {
      setActiveSearchTab("");
      router.setParams({ search: "" });
    } else {
      trackEvent(`Tab Switched: ${newSearchTab}`);
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
            aria-disabled={!isTabEnabled}
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
      {!isTabEnabled && !isSmallDevice && (
        <TooltipContent className="border-foreground/30 bg-background text-foreground">
          {tabTooltipRestrictionMap[searchTab]}
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export default SearchTabButton;
