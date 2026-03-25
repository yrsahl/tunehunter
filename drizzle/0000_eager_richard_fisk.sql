CREATE TYPE "public"."activity_type" AS ENUM('search', 'store_visit', 'wishlist');--> statement-breakpoint
CREATE TYPE "public"."listing_request_source" AS ENUM('db_cache', 'external', 'rate_limited', 'store_unreachable', 'no_match');--> statement-breakpoint
CREATE TYPE "public"."song_vendor_type" AS ENUM('itunes', 'bandcamp', 'beatport', 'amazon');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "artistGenres" (
	"artist_id" text NOT NULL,
	"genre_id" integer NOT NULL,
	CONSTRAINT "artistGenres_artist_id_genre_id_pk" PRIMARY KEY("artist_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "artist" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"popularity" integer,
	"followers" integer
);
--> statement-breakpoint
CREATE TABLE "clientCredentialsToken" (
	"token" varchar(255) PRIMARY KEY NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "genre" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "songArtists" (
	"song_id" text NOT NULL,
	"artist_id" text NOT NULL,
	CONSTRAINT "songArtists_song_id_artist_id_pk" PRIMARY KEY("song_id","artist_id")
);
--> statement-breakpoint
CREATE TABLE "songListingMiss" (
	"song_id" varchar(255) NOT NULL,
	"vendor_id" integer NOT NULL,
	"region" varchar(255) NOT NULL,
	"checked_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "songListingMiss_song_id_vendor_id_region_pk" PRIMARY KEY("song_id","vendor_id","region")
);
--> statement-breakpoint
CREATE TABLE "songListingRequest" (
	"id" serial PRIMARY KEY NOT NULL,
	"song_id" varchar(255),
	"vendor" varchar(255) NOT NULL,
	"source" "listing_request_source" NOT NULL,
	"fetch_duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "songListing" (
	"song_id" varchar(255) NOT NULL,
	"vendor_id" integer NOT NULL,
	"url" varchar(255) NOT NULL,
	"duration" integer NOT NULL,
	"price" varchar(255),
	"currency" varchar(255) NOT NULL,
	"region" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "songListing_song_id_vendor_id_region_pk" PRIMARY KEY("song_id","vendor_id","region")
);
--> statement-breakpoint
CREATE TABLE "songVendor" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" "song_vendor_type" NOT NULL,
	"artists_share" integer NOT NULL,
	"format" varchar(255) DEFAULT '' NOT NULL,
	"quality" varchar(255) DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "song" (
	"id" text PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"duration" integer NOT NULL,
	"album" varchar(255),
	"album_art_url" varchar(255),
	"year" varchar(255) NOT NULL,
	"genre" varchar(255),
	"spotify_id" varchar(255),
	"isrc" varchar(12)
);
--> statement-breakpoint
CREATE TABLE "userActivity" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"song_id" varchar(255),
	"type" "activity_type" NOT NULL,
	"region" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"theme" varchar(255),
	"themeParticles" boolean DEFAULT true,
	"language" varchar(255),
	"region" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artistGenres" ADD CONSTRAINT "artistGenres_artist_id_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artistGenres" ADD CONSTRAINT "artistGenres_genre_id_genre_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genre"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songArtists" ADD CONSTRAINT "songArtists_song_id_song_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."song"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songArtists" ADD CONSTRAINT "songArtists_artist_id_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songListingMiss" ADD CONSTRAINT "songListingMiss_song_id_song_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."song"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songListingMiss" ADD CONSTRAINT "songListingMiss_vendor_id_songVendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."songVendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songListingRequest" ADD CONSTRAINT "songListingRequest_song_id_song_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."song"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songListing" ADD CONSTRAINT "songListing_song_id_song_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."song"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songListing" ADD CONSTRAINT "songListing_vendor_id_songVendor_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."songVendor"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userActivity" ADD CONSTRAINT "userActivity_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userActivity" ADD CONSTRAINT "userActivity_song_id_song_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."song"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "songListingMiss_vendorId_idx" ON "songListingMiss" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "songListingMiss_region_idx" ON "songListingMiss" USING btree ("region");--> statement-breakpoint
CREATE INDEX "songListingRequest_vendor_idx" ON "songListingRequest" USING btree ("vendor");--> statement-breakpoint
CREATE INDEX "songListingRequest_source_idx" ON "songListingRequest" USING btree ("source");--> statement-breakpoint
CREATE INDEX "songListingRequest_createdAt_idx" ON "songListingRequest" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "songListing_vendorId_idx" ON "songListing" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "songListing_region_idx" ON "songListing" USING btree ("region");--> statement-breakpoint
CREATE INDEX "userActivity_userId_idx" ON "userActivity" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "userActivity_songId_idx" ON "userActivity" USING btree ("song_id");--> statement-breakpoint
CREATE INDEX "userActivity_type_idx" ON "userActivity" USING btree ("type");--> statement-breakpoint
CREATE INDEX "userActivity_userId_type_idx" ON "userActivity" USING btree ("user_id","type");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."trendingViewLast30Days" AS (select "song_id", count(*) as "searchCount" from "userActivity" where "userActivity"."created_at" >= now() - interval '''30 days''' group by "userActivity"."song_id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."trendingViewLast7Days" AS (select "song_id", count(*) as "searchCount" from "userActivity" where "userActivity"."created_at" >= now() - interval '''7 days''' group by "userActivity"."song_id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."trendingViewToday" AS (select "song_id", count(*) as "searchCount" from "userActivity" where "userActivity"."created_at" >= now() - interval '''1 day''' group by "userActivity"."song_id");