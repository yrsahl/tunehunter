import { clientCredentialsToken } from "@/server/db/schema";
import { requestClientCredentialsToken } from "@/services/spotify";
import { fetchAllPlaylistTracks } from "@/services/spotify/api";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  // spotify:playlist:ID
  if (trimmed.startsWith("spotify:playlist:")) {
    return trimmed.split(":")[2] ?? null;
  }
  // https://open.spotify.com/playlist/ID or https://open.spotify.com/playlist/ID?si=...
  try {
    const url = new URL(trimmed);
    if (url.hostname === "open.spotify.com") {
      const parts = url.pathname.split("/");
      const idx = parts.indexOf("playlist");
      if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]!;
    }
  } catch {}
  return null;
}

export const playlistRouter = createTRPCRouter({
  getTracks: publicProcedure.input(z.object({ url: z.string() })).query(async ({ ctx, input }) => {
    const playlistId = extractPlaylistId(input.url);
    if (!playlistId) return { error: "Invalid Spotify playlist URL." as const };

    // Get or refresh client credentials token
    const tokenData = await ctx.db.query.clientCredentialsToken.findFirst();
    const isExpired = tokenData?.expires && new Date() > tokenData.expires;

    let token: string;
    if (tokenData && !isExpired) {
      token = tokenData.token;
    } else {
      const newToken = await requestClientCredentialsToken();
      if (!newToken || "error" in newToken)
        return { error: "Failed to get Spotify token." as const };
      await ctx.db.delete(clientCredentialsToken).execute();
      await ctx.db
        .insert(clientCredentialsToken)
        .values({ token: newToken.access_token, expires: newToken.expires });
      token = newToken.access_token;
    }

    const tracks = await fetchAllPlaylistTracks(token, playlistId);
    if (tracks === null) return { error: "Playlist not found or is private." as const };

    return { tracks };
  }),
});
