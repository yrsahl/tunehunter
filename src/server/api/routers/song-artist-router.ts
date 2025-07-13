import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { songArtists } from "@/server/db/schema";
import { z } from "zod";

export const songArtistRouter = createTRPCRouter({
  // ********* Mutations *********
  addArtistsToSong: publicProcedure
    .input(z.object({ songId: z.string(), artistIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      // Check if song exists in song table
      const song = await ctx.db.query.songs.findFirst({
        where: (songs, { eq }) => eq(songs.id, input.songId),
      });
      if (!song) return { error: "songNotFound" };

      // Iterate over artistIds and process each one
      for (const artistId of input.artistIds) {
        // Check if artist exists
        const artist = await ctx.db.query.artists.findFirst({
          where: (artists, { eq }) => eq(artists.id, artistId),
        });
        if (!artist) return { error: `artistNotFound: ${artistId}` };

        // Check if artist has already been added to song
        const songArtist = await ctx.db.query.songArtists.findFirst({
          where: (songArtists, { and, eq }) =>
            and(eq(songArtists.songId, input.songId), eq(songArtists.artistId, artistId)),
        });
        if (songArtist) continue;

        // Add artist to song
        await ctx.db.insert(songArtists).values({
          songId: input.songId,
          artistId,
        });
      }

      return { success: "artistsAddedToSong" };
    }),
});
