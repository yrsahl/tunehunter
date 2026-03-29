import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().url(),
    DATABASE_URL_DEV: z.string().url(),
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    NEXTAUTH_SECRET: process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    EMAIL_SERVER_HOST: z.string(),
    EMAIL_SERVER_PORT: z.string(),
    EMAIL_SERVER_USER: z.string(),
    EMAIL_SERVER_PASSWORD: z.string(),
    EMAIL_FROM: z.string().email(),
    SPOTIFY_CLIENT_ID: z.string(),
    SPOTIFY_CLIENT_SECRET: z.string(),
    // Amazon Product Advertising API (PA API 5.0)
    // Credentials available once 3 qualified purchases are made in Associates portal.
    DASHBOARD_PASSWORD: z.string(),
    CRON_SECRET: z.string(),
    UPSTASH_EMAIL: z.string().email().optional(),
    UPSTASH_API_KEY: z.string().optional(),
    VERCEL_API_TOKEN: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string(),
    CLOUDINARY_API_KEY: z.string(),
    CLOUDINARY_API_SECRET: z.string(),
    AMAZON_PA_ACCESS_KEY: z.string().optional(),
    AMAZON_PA_SECRET_KEY: z.string().optional(),
    // Per-marketplace associate tags (add more as you register additional marketplaces)
    AMAZON_PA_TAG_GB: z.string().optional(),
    AMAZON_PA_TAG_US: z.string().optional(),
    AMAZON_PA_TAG_DE: z.string().optional(),
    AMAZON_PA_TAG_FR: z.string().optional(),
    AMAZON_PA_TAG_ES: z.string().optional(),
    AMAZON_PA_TAG_IT: z.string().optional(),
    AMAZON_PA_TAG_CA: z.string().optional(),
    AMAZON_PA_TAG_AU: z.string().optional(),
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    TELEGRAM_CHAT_ID: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_ITUNES_PROXY_URL: z.string().url().optional(),
    // Amazon affiliate tags — public, appear in outbound URLs
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_DE: z.string().optional(),
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_US: z.string().optional(),
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_GB: z.string().optional(),
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_FR: z.string().optional(),
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_ES: z.string().optional(),
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_IT: z.string().optional(),
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_CA: z.string().optional(),
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_AU: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_DEV: process.env.DATABASE_URL_DEV,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
    DASHBOARD_PASSWORD: process.env.DASHBOARD_PASSWORD,
    CRON_SECRET: process.env.CRON_SECRET,
    UPSTASH_EMAIL: process.env.UPSTASH_EMAIL,
    UPSTASH_API_KEY: process.env.UPSTASH_API_KEY,
    VERCEL_API_TOKEN: process.env.VERCEL_API_TOKEN,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    AMAZON_PA_ACCESS_KEY: process.env.AMAZON_PA_ACCESS_KEY,
    AMAZON_PA_SECRET_KEY: process.env.AMAZON_PA_SECRET_KEY,
    AMAZON_PA_TAG_GB: process.env.AMAZON_PA_TAG_GB,
    AMAZON_PA_TAG_US: process.env.AMAZON_PA_TAG_US,
    AMAZON_PA_TAG_DE: process.env.AMAZON_PA_TAG_DE,
    AMAZON_PA_TAG_FR: process.env.AMAZON_PA_TAG_FR,
    AMAZON_PA_TAG_ES: process.env.AMAZON_PA_TAG_ES,
    AMAZON_PA_TAG_IT: process.env.AMAZON_PA_TAG_IT,
    AMAZON_PA_TAG_CA: process.env.AMAZON_PA_TAG_CA,
    AMAZON_PA_TAG_AU: process.env.AMAZON_PA_TAG_AU,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    NEXT_PUBLIC_ITUNES_PROXY_URL: process.env.NEXT_PUBLIC_ITUNES_PROXY_URL,
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_DE: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_DE,
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_US: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_US,
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_GB: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_GB,
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_FR: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_FR,
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_ES: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_ES,
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_IT: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_IT,
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_CA: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_CA,
    NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_AU: process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG_AU,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
