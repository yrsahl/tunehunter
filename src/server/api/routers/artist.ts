import { AddArtistSchema } from "@/schemas";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { artists } from "@/server/db/schema";
import { z } from "zod";

export const artistRouter = createTRPCRouter({
  // ********* Queries *********
  getArtistById: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.db.query.artists.findFirst({
      where: (artist, { eq }) => eq(artist.id, input.id),
    });
  }),

  // ********* Mutations *********
  addArtist: publicProcedure.input(AddArtistSchema).mutation(async ({ ctx, input }) => {
    // Check if artist already exists
    const artist = await ctx.db.query.artists.findFirst({
      where: (artists, { eq }) => eq(artists.id, input.id),
    });
    if (artist) return { info: "ARTIST_ALREADY_EXISTS" };

    // Insert artist
    await ctx.db.insert(artists).values({
      id: input.id,
      name: input.name,
      popularity: input.popularity,
      followers: input.followers,
    });

    return {
      success: "ARTIST_ADDED",
    };
  }),

  addArtists: publicProcedure.input(z.array(AddArtistSchema)).mutation(async ({ ctx, input }) => {
    // Check if artists already exist
    const newArtistIds = input.map((artist) => artist.id);
    const existingArtists = await ctx.db.query.artists.findMany({
      where: (artists, { inArray }) => inArray(artists.id, newArtistIds),
    });
    const existingArtistIds = existingArtists.map((artist) => artist.id);

    // Insert new artists
    const newArtists = input.filter((artist) => !existingArtistIds.includes(artist.id));
    if (newArtists.length == 0)
      return {
        info: "ARTISTS_ALREADY_EXIST",
      };
    await ctx.db.insert(artists).values(newArtists);

    return {
      success: "ARTISTS_ADDED",
    };
  }),
});
