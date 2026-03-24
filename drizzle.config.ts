import { env } from "@/env";
import { type Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NODE_ENV === "development" ? env.DATABASE_URL_DEV : env.DATABASE_URL,
  },
} satisfies Config;
