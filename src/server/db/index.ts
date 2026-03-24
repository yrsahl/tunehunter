import { type NeonQueryFunction, neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "@/env";
import * as schema from "./schema";

const dbUrl = process.env.NODE_ENV === "development" ? env.DATABASE_URL_DEV : env.DATABASE_URL;
const sqlConnection: NeonQueryFunction<boolean, boolean> = neon(dbUrl);
export const db = drizzle(sqlConnection, { schema });
