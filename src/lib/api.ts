/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { type TRPCLink, TRPCClientError, httpBatchStreamLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { QueryCache, MutationCache } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import superjson from "superjson";

import { type AppRouter } from "@/server/api/root";

// Procedures that use rateLimitedProcedure on the server
const RATE_LIMITED_PATHS = new Set([
  "song.enrichArtists",
  "userActivities.addUserActivity",
  "clientCredentials.getToken",
  "artist.addSimpleArtist",
  "artist.addOrUpdateArtist",
  "artist.addSimpleArtists",
  "songArtist.addArtistsToSong",
]);

// Dev-only tRPC request tracker
let _devCount = 0;
let _devRateLimitedCount = 0;
let _devLog: { index: number; path: string; rateLimited: boolean }[] = [];
const _devListeners = new Set<() => void>();

export const resetDevTrpcLog = () => {
  _devCount = 0;
  _devRateLimitedCount = 0;
  _devLog = [];
  _devListeners.forEach((fn) => fn());
};

export const useDevTrpcLog = () => {
  const [log, setLog] = useState(_devLog);
  useEffect(() => {
    const fn = () => setLog([..._devLog]);
    _devListeners.add(fn);
    return () => { _devListeners.delete(fn); };
  }, []);
  return { count: _devCount, rateLimitedCount: _devRateLimitedCount, log };
};

const devCounterLink: TRPCLink<AppRouter> = () => ({ next, op }) =>
  observable((observer) => {
    const rateLimited = RATE_LIMITED_PATHS.has(op.path);
    _devCount++;
    if (rateLimited) _devRateLimitedCount++;
    _devLog = [..._devLog.slice(-49), { index: _devCount, path: op.path, rateLimited }];
    _devListeners.forEach((fn) => fn());
    return next(op).subscribe(observer);
  });

const onError = (error: unknown) => {
  if (error instanceof TRPCClientError && error.data?.code === "TOO_MANY_REQUESTS") {
    toast.error("Too many requests. Please wait a moment.", { id: "rate-limit" });
  }
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  transformer: superjson,
  config() {
    return {
      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        ...(process.env.NODE_ENV === "development" ? [devCounterLink] : []),
        httpBatchStreamLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
        }),
      ],
      queryClientConfig: {
        queryCache: new QueryCache({ onError }),
        mutationCache: new MutationCache({ onError }),
      },
      // ---- Invalidate everything on any mutation
      // overrides: {
      //   useMutation: {
      //     /**
      //      * This function is called whenever a `.useMutation` succeeds
      //      **/
      //     async onSuccess(opts: any) {
      //       /**
      //        * @note that order here matters:
      //        * The order here allows route changes in `onSuccess` without
      //        * having a flash of content change whilst redirecting.
      //        **/
      //       // Calls the `onSuccess` defined in the `useQuery()`-options:
      //       await opts.originalFn();
      //       // Invalidate all queries in the react-query cache:
      //       await opts.queryClient.invalidateQueries();
      //     },
      //   },
      // },
    };
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false,
});

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
