import { songListings, songs, songVendorArray, songVendors } from "@/server/db/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { z } from "zod";

// Schemas
export const SongListingSchema = z.object({
  vendor: z.enum(songVendorArray),
  region: z.string(),
  songId: z.string(),
  artist: z.string(),
  title: z.string(),
  duration: z.number(),
  album: z.union([z.string(), z.null()]),
});

// Interfaces
export type SongListing = InferSelectModel<typeof songListings>;
export type NewSongListing = InferInsertModel<typeof songListings>;
export type SongListingError = "INVALID_FIELDS" | "VENDOR_NOT_FOUND" | "NO_DATA_FOUND" | "STORE_UNREACHABLE" | "RATE_LIMITED";
export type SongListingResponse = SongListingSuccessResponse | SongListingErrorResponse;
interface SongListingSuccessResponse {
  data: SongListingWithRelations;
  error?: undefined;
}
interface SongListingErrorResponse {
  error: SongListingError;
  data?: undefined;
}

export type SongListingWithRelations = {
  listing: InferSelectModel<typeof songListings>;
  song: InferSelectModel<typeof songs>;
  songVendor: InferSelectModel<typeof songVendors>;
};
