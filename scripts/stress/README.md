# TuneHunter Stress Test Plan

This folder contains a practical stress-test harness for pre-launch verification.

## What it covers

1. Baseline load profile: confirms normal responsiveness.
2. Spike profile: reveals burst behavior and degradation.
3. Soak profile: catches long-running memory/performance drift.
4. tRPC rate-limit drill: intentionally produces `TOO_MANY_REQUESTS` to validate Redis counters and Telegram alerting.
5. Vendor probe profile: directly exercises `songListings.getSongListing` so scraper failures per vendor are visible.

## Prerequisites

1. Start TuneHunter locally or point to staging:
   - Local: `bun run dev`
   - Staging: set `BASE_URL=https://your-staging-host`
2. Install [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) if not already installed.

## Quick commands

1. Baseline:
   - `bun run stress:baseline`
2. Spike:
   - `bun run stress:spike`
3. Soak:
   - `bun run stress:soak`
4. Optional preview endpoint traffic:
   - `INCLUDE_PREVIEW=1 bun run stress:baseline`
5. tRPC rate-limit drill:
   - `bun run stress:trpc-rl`
6. Vendor probe:
   - `bun run stress:vendor-probe`
   - Optional vendor subset: `VENDOR_LIST=bandcamp,beatport bun run stress:vendor-probe`
   - Optional region override: `VENDOR_REGION=DE bun run stress:vendor-probe`

## Environment variables

1. `BASE_URL`
   - default: `http://localhost:3000`
2. `STRESS_PROFILE`
   - one of: `baseline`, `spike`, `soak`
3. `INCLUDE_PREVIEW`
   - `1` enables `/api/spotify/preview` traffic; default is disabled.
4. `CONCURRENCY` (for tRPC drill)
   - default: `25`
5. `DURATION_SECONDS` (for tRPC drill)
   - default: `180`
6. `PAUSE_MS` (for tRPC drill)
   - default: `50`
7. `VENDOR_LIST` (for vendor probe)
   - default: `itunes,bandcamp,beatport,amazon`
8. `VENDOR_REGION` (for vendor probe)
   - default: `US`

## Recommended execution order

1. Run baseline and save k6 summary output.
2. Run spike and compare p95/p99 latency + error rate against baseline.
3. Run tRPC rate-limit drill and verify:
   - Redis key `stats:trpc:rl:window` increases.
   - Hourly `scraper-alert` cron emits Telegram alert once threshold is crossed.
4. Run soak for at least 6 hours and monitor:
   - sustained latency,
   - memory growth,
   - DB/Redis usage trends.
5. Run vendor probe and inspect:
   - `vendor_probe_store_unreachable`
   - `vendor_probe_rate_limited`
   - `vendor_probe_no_data`
   - `vendor_probe_success`

## Suggested launch gates

1. `http_req_failed < 2%`
2. `p95 < 1500ms`, `p99 < 3000ms`
3. tRPC drill shows non-zero rate-limited responses (limiter works under stress).
4. Telegram alerts are sent for induced tRPC spikes and stale trending conditions.
5. Vendor probe does not show sustained growth in `vendor_probe_store_unreachable` for any vendor.
