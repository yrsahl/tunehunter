import IconButton from "@/components/IconButton";
import { LoadingIndicator } from "@/components/Indicators";
import { useSpotifyUserDataContext } from "@/contexts/SpotifyUserDataContext";
import { fadeInAndOut } from "@/helpers/animations";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { SpotifySubTab, spotifySubTabs } from "../Search/SearchTabContent";
import SpotifyTableRow from "../SpotifyTableRow";

const SpotifyTabHeaderMap = {
  recently_played: "Recently Played",
  queue: "Queue",
  top_tracks: "Top Tracks",
};

const SpotifyTable = () => {
  const [tab, setTab] = useState<SpotifySubTab>("recently_played");
  const { status } = useSession();
  const loggedIn = status === "authenticated";
  const { spotifyUserData, refreshSpotifyUserData, isSpotifyUserDataLoading } =
    useSpotifyUserDataContext();

  if (loggedIn && isSpotifyUserDataLoading) {
    return (
      <div className="flex h-full justify-center">
        <LoadingIndicator size={60} />
      </div>
    );
  }

  return (
    <div className="h-full w-full px-3 sm:px-5 md:px-7">
      <div className="border-x-1 absolute left-1/2 top-0 z-10 flex w-full max-w-[450px] -translate-x-1/2 items-center justify-around rounded-b-sm border-b-[1px] border-primary bg-background px-1 py-[6px]">
        {spotifySubTabs.map((spotifyTableTab) => (
          <button
            key={spotifyTableTab}
            className={cn(
              "whitespace-nowrap text-base transition-colors hover:text-foreground",
              spotifyTableTab === tab ? "text-foreground" : "text-muted-foreground",
            )}
            onClick={() => setTab(spotifyTableTab)}
            disabled={!spotifyUserData}
          >
            {SpotifyTabHeaderMap[spotifyTableTab]}
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
        {tab == "top_tracks" && spotifyUserData?.topTracks?.items.length == 0 && (
          <motion.div
            {...fadeInAndOut(0.15)}
            className="absolute-center flex items-center justify-center"
          >
            <p className="text-center">We received no data for your most played songs.</p>
          </motion.div>
        )}
        {tab == "queue" &&
          (!spotifyUserData?.queue || spotifyUserData.queue?.queue.length == 0) && (
            <motion.div
              {...fadeInAndOut(0.15)}
              className="absolute-center flex items-center justify-center"
            >
              <p className="text-center">Your queue is currently empty.</p>
            </motion.div>
          )}
        {tab == "recently_played" && spotifyUserData?.recentlyPlayed?.items.length == 0 && (
          <motion.div
            {...fadeInAndOut(0.15)}
            className="absolute-center flex items-center justify-center"
          >
            <p className="text-center">You haven't listened to any songs on Spotify recently.</p>
          </motion.div>
        )}
        <table className="w-full">
          {spotifyUserData && (
            <AnimatePresence mode="wait">
              <motion.tbody key={tab} {...fadeInAndOut(0.15)}>
                {tab == "queue" &&
                  spotifyUserData.queue?.queue.map((track, index) => (
                    <SpotifyTableRow key={`${track.id}/${index}`} track={track} />
                  ))}
                {tab == "recently_played" && (
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
                {tab == "top_tracks" &&
                  spotifyUserData.topTracks?.items.map((track) => (
                    <SpotifyTableRow key={track.id} track={track} />
                  ))}
              </motion.tbody>
            </AnimatePresence>
          )}
        </table>
      </div>
    </div>
  );
};

export default SpotifyTable;
