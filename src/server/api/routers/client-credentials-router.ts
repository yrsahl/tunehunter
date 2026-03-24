import { db } from "@/server/db";
import { clientCredentialsToken } from "@/server/db/schema";
import { requestClientCredentialsToken } from "@/services/spotify";
import { createTRPCRouter, rateLimitedProcedure } from "../trpc";

export const clientCredentialsRouter = createTRPCRouter({
  // Singleton behavior
  getToken: rateLimitedProcedure.query(async ({ ctx }) => {
    const clientCredentialsData = await ctx.db.query.clientCredentialsToken.findFirst();
    const isTokenExpired =
      clientCredentialsData?.expires && new Date() > clientCredentialsData.expires;

    // Return valid ones
    if (clientCredentialsData && !isTokenExpired) {
      return { token: clientCredentialsData.token };
    }

    // Or request new ones
    const newClientCredentialsData = await requestClientCredentialsToken();

    // Break if we didn't get any data
    if (!newClientCredentialsData || "error" in newClientCredentialsData) {
      return { error: "Failed to get new client credentials" };
    }

    // Save and return the new one
    const { access_token, expires } = newClientCredentialsData;
    await db.delete(clientCredentialsToken).execute();
    await db.insert(clientCredentialsToken).values({ token: access_token, expires });

    return { token: newClientCredentialsData.access_token };
  }),

  // setClientCredentialsToken: publicProcedure
  //   .input(ClientCredentialsTokenSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     // Delete all existing tokens
  //     await ctx.db.delete(clientCredentialsToken).execute();

  //     // Store new token
  //     await ctx.db
  //       .insert(clientCredentialsToken)
  //       .values({ token: input.token, expiresAt: input.expiresAt });

  //     return { success: true };
  //   }),
});
