import CustomIcon from "@/components/CustomIcon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useRouterWithHelpers from "@/hooks/useRouterWithHelpers";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { FC, useEffect, useState } from "react";
import HistoryTable from "../SongTables/HistoryTable";
import SpotifyTable from "../SongTables/SpotifyTable";
import TrendingTable from "../SongTables/TrendingTable";
import WishlistTable from "../SongTables/WishlistTable";

interface IProps {}

const tabs = ["trending", "spotify", "history", "wishlist"] as const;
export type Tab = (typeof tabs)[number];
const isTab = (tab: string): tab is Tab => tabs.includes(tab as Tab);

type AccessScopes = "all" | "signed-in-to-spotify" | "signed-in";
const tabAccessMap: Record<Tab, AccessScopes> = {
  trending: "all",
  spotify: "signed-in-to-spotify",
  history: "signed-in",
  wishlist: "signed-in",
};

const SearchTabs: FC<IProps> = ({}) => {
  const { t } = useTranslation("");
  const { data: userData, status: sessionStatus } = useSession();
  const router = useRouterWithHelpers();
  const [searchTab, setSearchTab] = useState<Tab | "">("");
  const loggedIn = sessionStatus === "authenticated";
  const { data: spotifyAccount } = api.account.getSpotifyAccountById.useQuery(
    { userId: userData?.user.id! },
    {
      refetchOnWindowFocus: false,
      enabled: !!userData,
      refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes to refresh the access token
    },
  );

  const getTabName = (tab: Tab) => t(`search.tabs.${tab}.header`);
  const getTooltipContent = (tab: Tab) => t(`auth.prompts.${tab}`);

  const isDisabledTab = (tab: Tab) => {
    if (tabAccessMap[tab] === "signed-in-to-spotify") return !spotifyAccount?.data; // Disabled if no spotify data
    if (tabAccessMap[tab] === "signed-in") return !loggedIn; // Disabled if not logged in
    return false; // Enabled otherwise
  };

  // Restore tab if param is present
  useEffect(() => {
    const searchParam = router.getParams("search");
    if (router.isReady && searchParam && isTab(searchParam)) {
      setSearchTab(searchParam);
    } else {
      setSearchTab("");
    }
  }, [router.isReady, router.query]);

  const tableContent = {
    "": <></>,
    spotify: <SpotifyTable />,
    trending: <TrendingTable setSearchTab={setSearchTab} />,
    history: <HistoryTable />,
    wishlist: <WishlistTable />,
  };

  const setTab = (newTab: Tab) => {
    if (newTab === searchTab) {
      setSearchTab("");
      router.setParams({ search: "" });
    } else {
      setSearchTab(newTab);
      router.setParams({ search: newTab });
    }
  };

  return (
    <>
      <div className="flex min-w-0 flex-wrap justify-center gap-4">
        {tabs.map((tab) => {
          const TabElement = ({ disabled = false }) => (
            <div className="flex items-center gap-2 px-1 pb-1">
              <CustomIcon icon={tab} variant={disabled ? "primary-muted" : "primary"} />
              {getTabName(tab)}
            </div>
          );

          if (isDisabledTab(tab)) {
            return (
              <Tooltip key={tab}>
                <TooltipTrigger className="cursor-not-allowed text-muted-foreground/30">
                  <TabElement disabled={true} />
                </TooltipTrigger>
                <TooltipContent>{getTooltipContent(tab)}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <motion.button
              key={tab}
              onClick={() => setTab(tab)}
              disabled={isDisabledTab(tab)}
              className={cn(
                "whitespace-nowrap border-b-2 text-foreground transition-all enabled:hover:border-primary/50",
                searchTab === tab ? "!border-primary" : "border-transparent",
              )}
            >
              <TabElement />
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        {searchTab !== "" && (
          <motion.div
            initial={{ height: "0rem" }}
            animate={{ height: "16rem" }}
            exit={{ height: "0rem" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="mt-4 h-full w-full resize-y overflow-hidden rounded-3xl border-[1px] border-foreground/30 bg-primary/10 md:w-4/5 "
          >
            <motion.div
              initial={{ opacity: loggedIn ? 0 : 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: loggedIn ? 0 : 1 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              key={searchTab}
              className={cn("relative mx-auto flex h-full w-full flex-col items-center")}
            >
              {tableContent[searchTab]}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SearchTabs;
