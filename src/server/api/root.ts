import { createTRPCRouter } from "@/server/api/trpc";
import { accountRouter } from "./routers/account";
import { clientCredentialsRouter } from "./routers/clientCredentials";
import { externalVendorRouter } from "./routers/externalVendor";
import { songRouter } from "./routers/song";
import { userRouter } from "./routers/user";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  account: accountRouter,
  song: songRouter,
  externalVendor: externalVendorRouter,
  clientCredentials: clientCredentialsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
