import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { env } from "@/env";
import * as schema from "./schema";

// Node.js 22+ ships native WebSocket; configure neon to use it
neonConfig.webSocketConstructor = WebSocket;

const dbUrl = process.env.NODE_ENV === "development" ? env.DATABASE_URL_DEV : env.DATABASE_URL;

// Reuse the pool across hot reloads in dev to avoid exhausting WebSocket connections
const globalForDb = globalThis as unknown as { pool: Pool | undefined };
if (!globalForDb.pool) {
  globalForDb.pool = new Pool({ connectionString: dbUrl });
}

export const db = drizzle(globalForDb.pool, { schema });
