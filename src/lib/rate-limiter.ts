import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

// General tRPC rate limit — broad guard against API abuse.
export const trpcRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  prefix: "rl:trpc",
});

// Email rate limit — strict cap to prevent verification email abuse.
export const emailRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  prefix: "rl:email",
});

// Per-vendor limits — applied on cache misses only (when outbound HTTP calls are made).
// Bandcamp: up to 4 outbound requests per lookup (1 search + 3 track pages),
// so 10 lookups/min ≈ 40 HTTP requests/min to Bandcamp.
// Beatport/Amazon: 1 request per lookup.
// iTunes: official API, more lenient.
export const vendorRateLimiters: Record<string, Ratelimit> = {
  bandcamp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "rl:vendor:bandcamp",
  }),
  beatport: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    prefix: "rl:vendor:beatport",
  }),
  itunes: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "1 m"),
    prefix: "rl:vendor:itunes",
  }),
  amazon: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    prefix: "rl:vendor:amazon",
  }),
};
