import { gte, relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgMaterializedView,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

// AUTH
export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  theme: varchar("theme", { length: 255 }),
  themeParticles: boolean().default(true),
  language: varchar("language", { length: 255 }),
  region: varchar("region", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  userActivities: many(userActivities),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"), // This shit needs to stay as is (integer and name) for NextAuth to work
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const clientCredentialsToken = pgTable("clientCredentialsToken", {
  token: varchar("token", { length: 255 }).notNull().primaryKey(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const sessions = pgTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

// Needs to be explicitly exported to be picked up by 'db:push' script
export const userActivityTypes = ["search", "store_visit", "wishlist"] as const;
export type UserActivityType = (typeof userActivityTypes)[number];
export const activityTypeEnum = pgEnum("activity_type", userActivityTypes);

// What people are searching or buying
export const userActivities = pgTable("userActivity", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  songId: varchar("song_id", { length: 255 }).references(() => songs.id),
  type: activityTypeEnum().notNull(),
  region: varchar("region", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
  song: one(songs, {
    fields: [userActivities.songId],
    references: [songs.id],
  }),
}));

// Genres
export const genres = pgTable("genre", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

// A particular artist
export const artists = pgTable("artist", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  popularity: integer("popularity"),
  followers: integer("followers"),
});

// A song identified by its (spotify) id
export const songs = pgTable("song", {
  id: text("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  duration: integer("duration").notNull(),
  album: varchar("album", { length: 255 }),
  albumArtUrl: varchar("album_art_url", { length: 255 }),
  year: varchar("year", { length: 255 }).notNull(),
  spotifyUrl: varchar("spotify_url", { length: 255 }).notNull(),
});

export const songsRelations = relations(songs, ({ many }) => ({
  songListings: many(songListings),
  userActivities: many(userActivities),
}));

// Many-to-many artists and songs
export const songArtists = pgTable(
  "songArtists",
  {
    songId: text("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    artistId: text("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.songId, table.artistId] }),
  }),
);

// Many-to-many artists and genres
export const artistGenres = pgTable(
  "artistGenres",
  {
    artistId: text("artist_id")
      .notNull()
      .references(() => artists.id, { onDelete: "cascade" }),
    genreId: integer("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.artistId, table.genreId] }),
  }),
);

export const songVendorTypes = ["itunes", "bandcamp", "beatport", "amazon"] as const;
export type SongVendorType = (typeof songVendorTypes)[number];
export const songVendorTypeEnum = pgEnum("song_vendor_type", songVendorTypes);

// A song vendor, i.e. BandCamp
export const songVendors = pgTable("songVendor", {
  id: serial("id").primaryKey(),
  name: songVendorTypeEnum().notNull(),
  artistsShare: integer("artists_share").notNull(),
});

export const songVendorsRelations = relations(songVendors, ({ many }) => ({
  songListings: many(songListings),
}));

// Individual song listings on a given vendor
export const songListings = pgTable(
  "songListing",
  {
    songId: varchar("song_id", { length: 255 })
      .notNull()
      .references(() => songs.id),
    vendorId: integer("vendor_id")
      .notNull()
      .references(() => songVendors.id),
    url: varchar("url", { length: 255 }).notNull(),
    quality: varchar("quality", { length: 255 }).notNull(),
    duration: integer("duration").notNull(),
    price: varchar("price", { length: 255 }),
    currency: varchar("currency", { length: 255 }).notNull(),
    region: varchar("region", { length: 255 }).notNull(),
    format: varchar("format", { length: 255 }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.songId, table.vendorId] }),
  }),
);

export const songListingsRelations = relations(songListings, ({ one }) => ({
  song: one(songs, {
    fields: [songListings.songId],
    references: [songs.id],
  }),
  songVendor: one(songVendors, {
    fields: [songListings.vendorId],
    references: [songVendors.id],
  }),
}));

// VIEW
// TODO: change to cron job (updates every 15 minutes) when on paid plan on Neon
const createTrendingView = (viewName: string, interval: string) => {
  return pgMaterializedView(viewName).as((qb) =>
    qb
      .select({
        songId: userActivities.songId,
        searchCount: sql<number>`count(*)`.as("searchCount"),
      })
      .from(userActivities)
      .groupBy(userActivities.songId)
      .where(gte(userActivities.createdAt, sql`now() - interval ${interval}`)),
  );
};

export const trendingViewToday = createTrendingView("trendingViewToday", "'1 day'");
export const trendingViewLast7Days = createTrendingView("trendingViewLast7Days", "'7 days'");
export const trendingViewLast30Days = createTrendingView("trendingViewLast30Days", "'30 days'");
