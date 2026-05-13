import { TRPCClientError, createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@/server/api/root";

const baseUrl = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const concurrency = Number(process.env.CONCURRENCY || 25);
const durationSeconds = Number(process.env.DURATION_SECONDS || 180);
const pauseMs = Number(process.env.PAUSE_MS || 50);

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${baseUrl}/api/trpc`,
      transformer: superjson,
    }),
  ],
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type WorkerResult = {
  ok: number;
  rateLimited: number;
  failed: number;
};

async function worker(stopAt: number): Promise<WorkerResult> {
  const result: WorkerResult = { ok: 0, rateLimited: 0, failed: 0 };

  while (Date.now() < stopAt) {
    try {
      await client.clientCredentials.getToken.query();
      result.ok++;
    } catch (error) {
      if (error instanceof TRPCClientError && error.data?.code === "TOO_MANY_REQUESTS") {
        result.rateLimited++;
      } else {
        result.failed++;
      }
    }

    if (pauseMs > 0) await sleep(pauseMs);
  }

  return result;
}

async function main() {
  const startedAt = Date.now();
  const stopAt = startedAt + durationSeconds * 1000;

  console.log("Starting tRPC rate-limit drill");
  console.log(
    JSON.stringify(
      {
        baseUrl,
        concurrency,
        durationSeconds,
        pauseMs,
        targetProcedure: "clientCredentials.getToken",
      },
      null,
      2,
    ),
  );

  const workers = Array.from({ length: concurrency }, () => worker(stopAt));
  const results = await Promise.all(workers);

  const totals = results.reduce(
    (acc, current) => ({
      ok: acc.ok + current.ok,
      rateLimited: acc.rateLimited + current.rateLimited,
      failed: acc.failed + current.failed,
    }),
    { ok: 0, rateLimited: 0, failed: 0 },
  );

  const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
  const totalRequests = totals.ok + totals.rateLimited + totals.failed;
  const rps = Math.round((totalRequests / elapsedSeconds) * 100) / 100;

  console.log("\nSummary");
  console.log(`- elapsed: ${elapsedSeconds}s`);
  console.log(`- total requests: ${totalRequests}`);
  console.log(`- approx req/s: ${rps}`);
  console.log(`- success: ${totals.ok}`);
  console.log(`- rate limited (429): ${totals.rateLimited}`);
  console.log(`- other failures: ${totals.failed}`);

  if (totals.rateLimited === 0) {
    console.log("\nNo TOO_MANY_REQUESTS observed. Increase CONCURRENCY or lower PAUSE_MS.");
  } else {
    console.log(
      "\nRate-limits observed. This should increment Redis key stats:trpc:rl:window and can trigger scraper-alert checks.",
    );
  }
}

void main();
