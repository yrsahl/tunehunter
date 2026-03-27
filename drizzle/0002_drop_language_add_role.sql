ALTER TABLE "user" ADD COLUMN "role" varchar(255) DEFAULT 'music_lover';
UPDATE "user" SET "role" = 'music_lover' WHERE "role" IS NULL;
ALTER TABLE "user" DROP COLUMN "language";
