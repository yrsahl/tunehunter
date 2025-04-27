import { AddArtistSchema, AddSimpleArtistSchema } from "@/schemas";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { artistGenres, artists, genres } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const artistRouter = createTRPCRouter({
  // ********* Queries *********
  getArtistById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // let artist = await ctx.db
      //   .select({
      //     id: artists.id,
      //     name: artists.name,
      //     popularity: artists.popularity,
      //     followers: artists.followers,
      //     genres: sql`array_agg(${genres.name})`.as("genres"),
      //   })
      //   .from(artists)
      //   .leftJoin(artistGenres, eq(artistGenres.artistId, artists.id))
      //   .leftJoin(genres, eq(artistGenres.genreId, genres.id))
      //   .where(eq(artists.id, input.id))
      //   .groupBy(artists.id);

      // return artist[0] || null;

      return await ctx.db.query.artists.findFirst({
        where: (artist, { eq }) => eq(artist.id, input.id),
        with: {
          artistGenres: {
            with: {
              genres: true,
            },
          },
        },
      });
    }),

  // ********* Mutations *********
  addSimpleArtist: publicProcedure.input(AddSimpleArtistSchema).mutation(async ({ ctx, input }) => {
    // Check if artist already exists
    const artist = await ctx.db.query.artists.findFirst({
      where: (artists, { eq }) => eq(artists.id, input.id),
    });
    if (artist) return { info: "ARTIST_ALREADY_EXISTS" };

    // Insert artist
    await ctx.db.insert(artists).values({
      id: input.id,
      name: input.name,
    });

    return {
      success: "ARTIST_ADDED",
    };
  }),

  addOrUpdateArtist: publicProcedure.input(AddArtistSchema).mutation(async ({ ctx, input }) => {
    // Check if artist already exists
    const artist = await ctx.db.query.artists.findFirst({
      where: (artists, { eq }) => eq(artists.id, input.id),
    });

    // Create artist
    if (artist) {
      // Amend
      await ctx.db
        .update(artists)
        .set({
          popularity: input.popularity,
          followers: input.followers,
        })
        .where(eq(artists.id, input.id));
    } else {
      // Insert artist
      await ctx.db.insert(artists).values({
        id: input.id,
        name: input.name,
        popularity: input.popularity,
        followers: input.followers,
      });
    }

    // Insert genres
    await ctx.db
      .insert(genres)
      .values(
        input.genres.map((genre) => ({
          name: genre,
        })),
      )
      .onConflictDoNothing();

    // Create artist - genre relation
    const genreIds = await ctx.db.query.genres.findMany({
      where: (genres, { inArray }) => inArray(genres.name, input.genres),
    });
    const genreIdValues = genreIds.map((genre) => ({
      artistId: input.id,
      genreId: genre.id,
    }));
    await ctx.db.insert(artistGenres).values(genreIdValues).onConflictDoNothing();

    return {
      success: "ARTIST_ADDED",
    };
  }),

  addSimpleArtists: publicProcedure
    .input(z.array(AddSimpleArtistSchema))
    .mutation(async ({ ctx, input }) => {
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
