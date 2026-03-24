/**
 * This is the client-side entrypoint for your tRPC API. It is used to create the `api` object which
 * contains the Next.js App-wrapper, as well as your type-safe React Query hooks.
 *
 * We also create a few inference helpers for input and output types.
 */
import { TRPCClientError, httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { toast } from "sonner";
import superjson from "superjson";

import { type AppRouter } from "@/server/api/root";

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
  config() {
    return {
      /**
       * Transformer used for data de-serialization from the server.
       *
       * @see https://trpc.io/docs/data-transformers
       */
      transformer: superjson,

      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        // loggerLink({
        //   enabled: (opts) =>
        //     process.env.NODE_ENV === "development" ||
        //     (opts.direction === "down" && opts.result instanceof Error),
        // }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      queryClientConfig: {
        defaultOptions: {
          queries: { onError },
          mutations: { onError },
        },
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
