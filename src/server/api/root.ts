import { createTRPCRouter } from "@/server/api/trpc";
import { accountRouter } from "./routers/account";
import { artistRouter } from "./routers/artist";
import { clientCredentialsRouter } from "./routers/clientCredentials";
import { externalVendorRouter } from "./routers/externalVendor";
import { songRouter } from "./routers/song";
import { songArtistRouter } from "./routers/songArtist";
import { userRouter } from "./routers/user";
import { userActivitiesRouter } from "./routers/userActivity";

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
  externalVendor: externalVendorRouter,
  clientCredentials: clientCredentialsRouter,
  userActivities: userActivitiesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
