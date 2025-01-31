import { artists, songs } from "@/server/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type Track = {
  song: InferSelectModel<typeof songs>;
  artists: InferSelectModel<typeof artists>[];
};

export type TrendingTrack = {
  searchCount: number;
} & Track;

export type UserActivityTrack = {
  type: "search" | "purchase" | "wishlist";
  createdAt: Date;
} & Track;

export type UserHistory = {
  userId: string;
  searchHistory: UserActivityTrack[];
  purchaseHistory: UserActivityTrack[];
};
