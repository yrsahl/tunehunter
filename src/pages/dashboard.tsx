import { api } from "@/lib/api";
import type { NextPage } from "next";

const vendors = ["itunes", "bandcamp", "beatport", "amazon"] as const;

type ServiceRow = {
  name: string;
  description: string;
  limit: string;
  usageLabel: string;
  usageValue: string | null; // null = not yet implemented
  url: string;
};

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col gap-1 rounded-lg border border-primary/20 bg-background/50 p-6">
    <span className="text-3xl font-semibold">{value.toLocaleString()}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
    {children}
  </h2>
);

const Dashboard: NextPage = () => {
  const { data, isLoading } = api.stats.getStats.useQuery(undefined, { staleTime: 60 * 1000 });
  const { data: serviceUsage } = api.stats.getServiceUsage.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const { data: insights } = api.stats.getInsights.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });
  const { data: scraperHealth } = api.stats.getScraperHealth.useQuery(undefined, {
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) return <div className="p-10 text-muted-foreground">Loading...</div>;
  if (!data) return null;

  const totalListingRequests = data.dbCacheHits + data.externalFetches + data.noMatch;
  const cacheRate =
    totalListingRequests > 0 ? Math.round((data.dbCacheHits / totalListingRequests) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Overview cards */}
      <section className="flex flex-col gap-3">
        <SectionHeading>Overview</SectionHeading>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Total searches" value={data.totalSearches} />
          <StatCard label="Listing requests" value={totalListingRequests} />
          <StatCard label="Served from cache" value={data.dbCacheHits} />
          <StatCard label="Fetched externally" value={data.externalFetches + data.noMatch} />
          <StatCard label="tRPC rate limited" value={data.trpcRateLimited} />
        </div>
        {totalListingRequests > 0 && (
          <p className="text-sm text-muted-foreground">
            Cache hit rate: <span className="font-medium text-foreground">{cacheRate}%</span>
          </p>
        )}
      </section>

      {/* Listing requests */}
      <section className="flex flex-col gap-3">
        <SectionHeading>Listing requests</SectionHeading>
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-1/6" />
            <col className="w-1/6" />
            <col className="w-1/6" />
            <col className="w-1/6" />
            <col className="w-1/6" />
            <col className="w-1/6" />
          </colgroup>
          <thead>
            <tr className="border-b border-primary/10 text-left text-muted-foreground">
              <th className="pb-2 font-normal">Vendor</th>
              <th className="pb-2 font-normal">Total</th>
              <th className="pb-2 font-normal">From cache</th>
              <th className="pb-2 font-normal">External</th>
              <th className="pb-2 font-normal">Rate limited</th>
              <th className="pb-2 font-normal">Unreachable</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => {
              const cache = Number(
                data.byVendor.find((r) => r.vendor === vendor && r.source === "db_cache")?.count ??
                  0,
              );
              const external = Number(
                data.byVendor.find((r) => r.vendor === vendor && r.source === "external")?.count ??
                  0,
              );
              const noMatch = Number(
                data.byVendor.find((r) => r.vendor === vendor && r.source === "no_match")?.count ??
                  0,
              );
              const rateLimited = Number(
                data.byVendor.find((r) => r.vendor === vendor && r.source === "rate_limited")
                  ?.count ?? 0,
              );
              const unreachable = Number(
                data.byVendor.find((r) => r.vendor === vendor && r.source === "store_unreachable")
                  ?.count ?? 0,
              );
              const externalTotal = external + noMatch;
              const total = cache + externalTotal;
              const vendorLabel =
                vendor === "itunes" ? "iTunes" : vendor.charAt(0).toUpperCase() + vendor.slice(1);
              return (
                <tr key={vendor} className="border-b border-primary/5">
                  <td className="py-3">{vendorLabel}</td>
                  <td className="py-3 font-medium">{total.toLocaleString()}</td>
                  <td className="py-3">{cache.toLocaleString()}</td>
                  <td className="py-3">
                    {externalTotal.toLocaleString()}
                    {total > 0 && (
                      <span className="ml-1 text-muted-foreground">
                        ({Math.round((externalTotal / total) * 100)}%)
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {rateLimited > 0 ? (
                      <span className="text-yellow-500">{rateLimited.toLocaleString()}</span>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="py-3">
                    {unreachable > 0 ? (
                      <span className="text-red-500">{unreachable.toLocaleString()}</span>
                    ) : (
                      0
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Match quality */}
      <section className="flex flex-col gap-3">
        <SectionHeading>Match quality</SectionHeading>
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
            <col className="w-1/4" />
          </colgroup>
          <thead>
            <tr className="border-b border-primary/10 text-left text-muted-foreground">
              <th className="pb-2 font-normal">Vendor</th>
              <th className="pb-2 font-normal">Total</th>
              <th className="pb-2 font-normal">Match</th>
              <th className="pb-2 font-normal">No match</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => {
              const cache = Number(
                data.byVendor.find((r) => r.vendor === vendor && r.source === "db_cache")?.count ??
                  0,
              );
              const external = Number(
                data.byVendor.find((r) => r.vendor === vendor && r.source === "external")?.count ??
                  0,
              );
              const noMatch = Number(
                data.byVendor.find((r) => r.vendor === vendor && r.source === "no_match")?.count ??
                  0,
              );
              const matched = cache + external;
              const total = matched + noMatch;
              const vendorLabel =
                vendor === "itunes" ? "iTunes" : vendor.charAt(0).toUpperCase() + vendor.slice(1);
              return (
                <tr key={vendor} className="border-b border-primary/5">
                  <td className="py-3">{vendorLabel}</td>
                  <td className="py-3 font-medium">{total.toLocaleString()}</td>
                  <td className="py-3">{matched.toLocaleString()}</td>
                  <td className="py-3">
                    {noMatch > 0 ? (
                      <span
                        className={
                          total > 0 && noMatch / total > 0.2 ? "text-yellow-500" : "text-foreground"
                        }
                      >
                        {noMatch.toLocaleString()}
                        {total > 0 && (
                          <span className="ml-1 text-muted-foreground">
                            ({Math.round((noMatch / total) * 100)}%)
                          </span>
                        )}
                      </span>
                    ) : (
                      0
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Vendor health */}
      <section className="flex flex-col gap-3">
        <SectionHeading>Vendor health</SectionHeading>
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
            <col className="w-[17%]" />
            <col className="w-[17%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-primary/10 text-left text-muted-foreground">
              <th className="pb-2 font-normal">Vendor</th>
              <th className="pb-2 font-normal">Avg latency</th>
              <th className="pb-2 font-normal">P95 latency</th>
              <th className="pb-2 font-normal">Unreachable (24h)</th>
              <th className="pb-2 font-normal">No-match (24h)</th>
              <th className="pb-2 font-normal">Last failure</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => {
              const avgMs = insights?.vendorLatency.find((v) => v.vendor === vendor)?.avgMs ?? null;
              const p95Ms =
                scraperHealth?.p95Latency.find((r) => r.vendor === vendor)?.p95Ms ?? null;
              const failures24h = Number(
                scraperHealth?.unreachable24h.find((r) => r.vendor === vendor)?.count ?? 0,
              );
              const noMatch24h = Number(
                scraperHealth?.attempts24h.find(
                  (r) => r.vendor === vendor && r.source === "no_match",
                )?.count ?? 0,
              );
              const external24h = Number(
                scraperHealth?.attempts24h.find(
                  (r) => r.vendor === vendor && r.source === "external",
                )?.count ?? 0,
              );
              const totalAttempts24h = noMatch24h + external24h;
              const noMatchRate24h =
                totalAttempts24h > 0 ? Math.round((noMatch24h / totalAttempts24h) * 100) : null;
              const lastAt =
                scraperHealth?.lastFailure.find((r) => r.vendor === vendor)?.lastAt ?? null;
              const vendorLabel =
                vendor === "itunes" ? "iTunes" : vendor.charAt(0).toUpperCase() + vendor.slice(1);
              const lastFailureLabel = lastAt
                ? new Date(lastAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Never";

              return (
                <tr key={vendor} className="border-b border-primary/5">
                  <td className="py-3">{vendorLabel}</td>
                  <td className="py-3">
                    {avgMs != null ? (
                      `${Number(avgMs).toLocaleString()} ms`
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    {p95Ms != null ? (
                      <span
                        className={
                          Number(p95Ms) > 6500
                            ? "text-red-500"
                            : Number(p95Ms) > 4000
                              ? "text-yellow-500"
                              : ""
                        }
                      >
                        {Number(p95Ms).toLocaleString()} ms
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3">
                    {failures24h > 5 ? (
                      <span className="text-red-500">{failures24h}</span>
                    ) : failures24h > 0 ? (
                      <span className="text-yellow-500">{failures24h}</span>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="py-3">
                    {noMatchRate24h != null ? (
                      <span
                        className={
                          noMatchRate24h > 50
                            ? "text-red-500"
                            : noMatchRate24h > 20
                              ? "text-yellow-500"
                              : ""
                        }
                      >
                        {noMatch24h}{" "}
                        <span className="text-muted-foreground">({noMatchRate24h}%)</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3 text-muted-foreground">{lastFailureLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* External services */}
      <section className="flex flex-col gap-3">
        <SectionHeading>External services</SectionHeading>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10 text-left text-muted-foreground">
              <th className="pb-2 font-normal">Service</th>
              <th className="pb-2 font-normal">Purpose</th>
              <th className="pb-2 font-normal">Free tier limit</th>
              <th className="pb-2 font-normal">This month</th>
              <th className="pb-2 font-normal" />
            </tr>
          </thead>
          <tbody>
            {(
              [
                {
                  name: "Vercel",
                  description: "Hosting & deployments",
                  limit: "100 GB bandwidth, 10s function timeout",
                  usageLabel: "bandwidth",
                  usageValue:
                    serviceUsage?.vercelBandwidthUsedGb != null
                      ? `${serviceUsage.vercelBandwidthUsedGb} GB / 100 GB`
                      : null,
                  url: "https://vercel.com/dashboard",
                },
                {
                  name: "Neon",
                  description: "PostgreSQL database",
                  limit: "0.5 GB storage, 191 compute hours/month",
                  usageLabel: "compute hours",
                  usageValue: null,
                  url: "https://console.neon.tech",
                },
                {
                  name: "Upstash",
                  description: "Redis (rate limiting, stats)",
                  limit: "500k commands/month",
                  usageLabel: "commands",
                  usageValue:
                    serviceUsage?.upstashCommandsThisMonth != null
                      ? `${serviceUsage.upstashCommandsThisMonth.toLocaleString()} / 500,000`
                      : null,
                  url: "https://console.upstash.com",
                },
                {
                  name: "Resend",
                  description: "Transactional email",
                  limit: "3,000 emails/month, 100/day",
                  usageLabel: "emails",
                  usageValue:
                    serviceUsage?.resendEmailsThisMonth != null
                      ? `${serviceUsage.resendEmailsThisMonth.toLocaleString()} / 3,000`
                      : null,
                  url: "https://resend.com/overview",
                },
              ] satisfies ServiceRow[]
            ).map((s) => (
              <tr key={s.name} className="border-b border-primary/5">
                <td className="py-3 font-medium">{s.name}</td>
                <td className="py-3 text-muted-foreground">{s.description}</td>
                <td className="py-3 text-muted-foreground">{s.limit}</td>
                <td className="py-3">
                  {s.usageValue != null ? (
                    <span>{s.usageValue}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-3">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Dashboard ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;
