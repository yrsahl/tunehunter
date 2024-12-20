import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
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
  language: varchar("language", { length: 255 }),
  region: varchar("region", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  queries: many(queries),
  wishlists: many(wishlists),
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

// Interesting data
export const queries = pgTable(
  "query",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    songId: integer("song_id")
      .notNull()
      .references(() => songs.id),
    searchedAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.songId] }),
  }),
);

export const queriesRelations = relations(queries, ({ one }) => ({
  user: one(users, {
    fields: [queries.userId],
    references: [users.id],
  }),
  song: one(songs, {
    fields: [queries.songId],
    references: [songs.id],
  }),
}));

export const wishlists = pgTable(
  "wishlist",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    songId: integer("song_id")
      .notNull()
      .references(() => songs.id),
    addedAt: timestamp("createdAt", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    compoundKey: primaryKey({ columns: [table.userId, table.songId] }),
  }),
);

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  song: one(songs, {
    fields: [wishlists.songId],
    references: [songs.id],
  }),
}));

export const songs = pgTable("song", {
  id: serial("id").primaryKey(),
  artists: varchar("artists", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  duration: varchar("duration", { length: 255 }).notNull(),
  album: varchar("album", { length: 255 }).notNull(),
  albumArtUrl: varchar("album_art_url", { length: 255 }).notNull(),
  year: varchar("year", { length: 255 }).notNull(),
  genre: varchar("genre", { length: 255 }).notNull(),
  spotifyUrl: varchar("spotify_url", { length: 255 }).notNull(),
});

export const songsRelations = relations(songs, ({ many }) => ({
  songListings: many(songListings),
  queries: many(queries),
  wishlists: many(wishlists),
}));

export const songVendors = pgTable("songVendor", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  region: varchar("region", { length: 255 }).notNull(),
});

export const songVendorsRelations = relations(songVendors, ({ many }) => ({
  songListings: many(songListings),
}));

export const songListings = pgTable(
  "songListing",
  {
    songId: integer("song_id")
      .notNull()
      .references(() => songs.id),
    vendorId: integer("vendor_id")
      .notNull()
      .references(() => songVendors.id),
    link: varchar("link", { length: 255 }).notNull(),
    quality: varchar("quality", { length: 255 }).notNull(),
    price: varchar("price", { length: 255 }).notNull(),
    currency: varchar("currency", { length: 255 }).notNull(),
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
