import IconButton from "@/components/IconButton";
import { LoadingIndicator } from "@/components/Indicators";
import { useSpotifyContext } from "@/contexts/SpotifyContext";
import { fadeInAndOut } from "@/helpers/animations";
import { signInWithProvider } from "@/helpers/sign-in";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";
import SpotifyTableRow from "../SpotifyTableRow";
import LoginPromptMockTable from "./LoginPromptMockTable";

export const spotifyTableTabs = ["recentlyPlayed", "queue", "topTracks"] as const;
export type SpotifyTableTab = (typeof spotifyTableTabs)[number];

const SpotifyTable = () => {
  const [tab, setTab] = useState<SpotifyTableTab>("recentlyPlayed");
  const { t } = useTranslation();
  const router = useRouter();
  const { status } = useSession();
  const loggedIn = status === "authenticated";

  const { spotifyUserData, refreshSpotifyUserData, isSpotifyUserDataLoading } = useSpotifyContext();

  if (loggedIn && isSpotifyUserDataLoading) {
    return (
      <div className="flex h-full justify-center">
        <LoadingIndicator size={60} />
      </div>
    );
  }

  return (
    <>
      {!loggedIn || !spotifyUserData ? (
        <LoginPromptMockTable
          promptText={t("search.spotify.connectPrompt")}
          icon="spotify"
          onClickFunc={() => signInWithProvider("spotify", router.locale ?? "")}
        />
      ) : (
        <div className="h-full w-full px-3 sm:px-5 md:px-7">
          <div className="border-x-1 absolute left-1/2 top-0 z-10 flex w-full max-w-[450px] -translate-x-1/2 items-center justify-around rounded-b-sm border-b-[1px] border-primary bg-background px-1 py-[6px]">
            {spotifyTableTabs.map((spotifyTableTab) => (
              <button
                key={spotifyTableTab}
                className={cn(
                  "whitespace-nowrap text-base transition-colors hover:text-foreground",
                  spotifyTableTab === tab ? "text-foreground" : "text-muted-foreground",
                )}
                onClick={() => setTab(spotifyTableTab)}
                disabled={!spotifyUserData}
              >
                {t(`search.spotify.${spotifyTableTab}.header`)}
              </button>
            ))}
          </div>
          <div className="absolute right-8 top-3 z-10 cursor-pointer opacity-60">
            <IconButton
              icon="refresh"
              size="icon"
              iconSize="22px"
              variant="ghostPrimary"
              className="border-0"
              onClick={refreshSpotifyUserData}
            />
          </div>
          <div
            className={cn(
              "hide-scrollbars relative h-full w-full pb-6 pt-12",
              spotifyUserData && "overflow-scroll",
            )}
          >
            {tab == "topTracks" && spotifyUserData.topTracks?.items.length == 0 && (
              <motion.div
                {...fadeInAndOut}
                className="absolute-center flex items-center justify-center"
              >
                <p className="text-center">{t("search.spotify.topTracks.empty")}</p>
              </motion.div>
            )}
            {tab == "queue" &&
              (!spotifyUserData.queue || spotifyUserData.queue?.queue.length == 0) && (
                <motion.div
                  {...fadeInAndOut}
                  className="absolute-center flex items-center justify-center"
                >
                  <p className="text-center">{t("search.spotify.queue.empty")}</p>
                </motion.div>
              )}
            {tab == "recentlyPlayed" && spotifyUserData.recentlyPlayed?.items.length == 0 && (
              <motion.div
                {...fadeInAndOut}
                className="absolute-center flex items-center justify-center"
              >
                <p className="text-center">{t("search.spotify.recentlyPlayed.empty")}</p>
              </motion.div>
            )}
            <table className="w-full">
              {spotifyUserData && (
                <AnimatePresence mode="wait">
                  <motion.tbody key={tab} {...fadeInAndOut}>
                    {tab == "queue" &&
                      spotifyUserData.queue?.queue.map((track, index) => (
                        <SpotifyTableRow key={`${track.id}/${index}`} track={track} />
                      ))}
                    {tab == "recentlyPlayed" && (
                      <>
                        {spotifyUserData.currentlyPlaying?.is_playing && (
                          <SpotifyTableRow
                            key={spotifyUserData.currentlyPlaying.item.id}
                            track={spotifyUserData.currentlyPlaying.item}
                            currentlyPlaying={true}
                          />
                        )}
                        {spotifyUserData.recentlyPlayed?.items.map((track, index) => (
                          <SpotifyTableRow key={`${track.track.id}/${index}`} track={track.track} />
                        ))}
                      </>
                    )}
                    {tab == "topTracks" &&
                      spotifyUserData.topTracks?.items.map((track) => (
                        <SpotifyTableRow key={track.id} track={track} />
                      ))}
                  </motion.tbody>
                </AnimatePresence>
              )}
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default SpotifyTable;
