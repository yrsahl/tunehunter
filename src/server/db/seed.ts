/**
 * Run with: npx tsx src/server/db/seed.ts
 * Updates songVendors with static quality/format metadata.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

const VENDOR_METADATA: Record<string, { quality: string; format: string }> = {
  itunes:   { quality: "256kbps", format: "AAC" },
  amazon:   { quality: "256kbps", format: "MP3" },
  beatport: { quality: "320kbps", format: "MP3 & WAV" },
  bandcamp: { quality: "Variable", format: "Multiple" },
};

const vendors = await db.query.songVendors.findMany();

for (const vendor of vendors) {
  const meta = VENDOR_METADATA[vendor.name];
  if (!meta) {
    console.warn(`No metadata for vendor: ${vendor.name}`);
    continue;
  }
  await db
    .update(schema.songVendors)
    .set({ quality: meta.quality, format: meta.format })
    .where(eq(schema.songVendors.id, vendor.id));
  console.log(`✓ ${vendor.name}: ${meta.format} / ${meta.quality}`);
}

console.log("Seed complete.");
