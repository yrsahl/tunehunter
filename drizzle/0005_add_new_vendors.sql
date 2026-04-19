ALTER TYPE "public"."song_vendor_type" ADD VALUE 'traxsource';--> statement-breakpoint
ALTER TYPE "public"."song_vendor_type" ADD VALUE 'junodownload';--> statement-breakpoint
ALTER TYPE "public"."song_vendor_type" ADD VALUE 'qobuz';--> statement-breakpoint
ALTER TYPE "public"."song_vendor_type" ADD VALUE 'hdtracks';--> statement-breakpoint
ALTER TYPE "public"."song_vendor_type" ADD VALUE 'sevendigital';--> statement-breakpoint
INSERT INTO "songVendor" ("name", "artists_share", "format", "quality") VALUES
  ('traxsource',  0, 'MP3 & WAV',             '320kbps'),
  ('junodownload',0, 'MP3 & WAV & FLAC',       'Variable'),
  ('qobuz',       0, 'FLAC & MP3',             'Up to 24-bit/192kHz'),
  ('hdtracks',    0, 'FLAC & More',            'Up to 24-bit/192kHz'),
  ('sevendigital',0, 'MP3',                    '320kbps');
