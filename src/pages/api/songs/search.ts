import { db } from "@/server/db";
import { artists, songArtists, songs } from "@/server/db/schema";
import { SearchData } from "@/types/search-types";
import { Track } from "@/types/song-types";
import { eq, ilike, inArray, or, sql } from "drizzle-orm";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchData | { error: string }>,
) {
  const { q } = req.query;
  if (!q || typeof q !== "string") return res.status(400).json({ error: "Missing query" });

  const query = q.trim();
  if (!query) return res.status(400).json({ error: "Empty query" });

  // Step 1: Find matching song IDs by title OR associated artist name
  const matchingIds = await db
    .selectDistinct({ id: songs.id })
    .from(songs)
    .leftJoin(songArtists, eq(songArtists.songId, songs.id))
    .leftJoin(artists, eq(artists.id, songArtists.artistId))
    .where(or(ilike(songs.title, `%${query}%`), ilike(artists.name, `%${query}%`)))
    .limit(30);

  if (matchingIds.length === 0) {
    return res.status(200).json({ tracks: { items: [] } });
  }

  // Step 2: Fetch full song + aggregated artists for matching IDs
  const rows = await db
    .select({
      song: {
        id: songs.id,
        title: songs.title,
        duration: songs.duration,
        album: songs.album,
        albumArtUrl: songs.albumArtUrl,
        year: songs.year,
        genre: songs.genre,
        spotifyId: songs.spotifyId,
        previewUrl: songs.previewUrl,
        isrc: songs.isrc,
      },
      artists: sql<{ id: string; name: string; popularity: number | null; followers: number | null }[]>`
        array_agg(json_build_object(
          'id', ${artists.id},
          'name', ${artists.name},
          'popularity', ${artists.popularity},
          'followers', ${artists.followers}
        ))`.as("artists"),
    })
    .from(songs)
    .innerJoin(songArtists, eq(songArtists.songId, songs.id))
    .innerJoin(artists, eq(artists.id, songArtists.artistId))
    .where(inArray(songs.id, matchingIds.map((r) => r.id)))
    .groupBy(songs.id);

  const items: Track[] = rows.map((row) => ({
    song: row.song,
    artists: row.artists,
  }));

  return res.status(200).json({ tracks: { items } });
}
