import { z } from "zod";

// Schemas
export const AddUserActivitySchema = z.object({
  type: z.enum(["search", "store_visit", "wishlist"]),
  songId: z.string(),
  region: z.string(),
});

export const RemoveUserActivitySchema = z.object({
  type: z.enum(["search", "store_visit", "wishlist"]),
  songId: z.string(),
});

export const GetUserActivitySchema = z.object({
  type: z.enum(["search", "store_visit", "wishlist"]),
});

// Interfaces
