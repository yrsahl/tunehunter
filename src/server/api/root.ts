import { createTRPCRouter } from "@/server/api/trpc";
import { accountRouter } from "./routers/account-router";
import { artistRouter } from "./routers/artist-router";
import { clientCredentialsRouter } from "./routers/client-credentials-router";
import { playlistRouter } from "./routers/playlist-router";
import { songArtistRouter } from "./routers/song-artist-router";
import { songListingsRouter } from "./routers/song-listings-router";
import { songRouter } from "./routers/song-router";
import { statsRouter } from "./routers/stats-router";
import { userActivitiesRouter } from "./routers/user-activity-router";
import { userRouter } from "./routers/user-router";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  account: accountRouter,
  artist: artistRouter,
  song: songRouter,
  songArtists: songArtistRouter,
  songListings: songListingsRouter,
  clientCredentials: clientCredentialsRouter,
  playlist: playlistRouter,
  userActivities: userActivitiesRouter,
  stats: statsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
