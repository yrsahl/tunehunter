import { api } from "@/lib/api";
import type { NextPage } from "next";

const vendors = ["itunes", "bandcamp", "beatport", "amazon"] as const;

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="flex flex-col gap-1 rounded-lg border border-primary/20 bg-background/50 p-6">
    <span className="text-3xl font-semibold">{value.toLocaleString()}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

const Dashboard: NextPage = () => {
  const { data, isLoading } = api.stats.getStats.useQuery();

  if (isLoading) return <div className="p-10 text-muted-foreground">Loading...</div>;
  if (!data) return null;

  const totalListingRequests = data.dbCacheHits + data.externalFetches;
  const cacheRate =
    totalListingRequests > 0 ? Math.round((data.dbCacheHits / totalListingRequests) * 100) : 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Top stats */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total searches" value={data.totalSearches} />
          <StatCard label="Listing requests" value={totalListingRequests} />
          <StatCard label="Served from cache" value={data.dbCacheHits} />
          <StatCard label="Fetched externally" value={data.externalFetches} />
        </div>
        {totalListingRequests > 0 && (
          <p className="text-sm text-muted-foreground">
            Cache hit rate: <span className="font-medium text-foreground">{cacheRate}%</span>
          </p>
        )}
      </section>

      {/* Breakdown by vendor */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          By vendor
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary/10 text-left text-muted-foreground">
              <th className="pb-2 font-normal">Vendor</th>
              <th className="pb-2 font-normal">From cache</th>
              <th className="pb-2 font-normal">External</th>
              <th className="pb-2 font-normal">No match</th>
              <th className="pb-2 font-normal">Rate limited</th>
              <th className="pb-2 font-normal">Unreachable</th>
              <th className="pb-2 font-normal">Total</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => {
              const cache =
                data.byVendor.find((r) => r.vendor === vendor && r.source === "db_cache")?.count ??
                0;
              const external =
                data.byVendor.find((r) => r.vendor === vendor && r.source === "external")?.count ??
                0;
              const noMatch =
                data.byVendor.find((r) => r.vendor === vendor && r.source === "no_match")?.count ??
                0;
              const rateLimited =
                data.byVendor.find((r) => r.vendor === vendor && r.source === "rate_limited")
                  ?.count ?? 0;
              const unreachable =
                data.byVendor.find((r) => r.vendor === vendor && r.source === "store_unreachable")
                  ?.count ?? 0;
              return (
                <tr key={vendor} className="border-b border-primary/5">
                  <td className="py-3 capitalize">{vendor}</td>
                  <td className="py-3">{Number(cache).toLocaleString()}</td>
                  <td className="py-3">{Number(external).toLocaleString()}</td>
                  <td className="py-3">
                    {Number(noMatch) > 0 ? (
                      <span className="text-muted-foreground">
                        {Number(noMatch).toLocaleString()}
                      </span>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="py-3">
                    {Number(rateLimited) > 0 ? (
                      <span className="text-yellow-500">
                        {Number(rateLimited).toLocaleString()}
                      </span>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="py-3">
                    {Number(unreachable) > 0 ? (
                      <span className="text-red-500">{Number(unreachable).toLocaleString()}</span>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="py-3 font-medium">
                    {(Number(cache) + Number(external)).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* API protection */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          API Protection
        </h2>
        <p className="text-sm text-muted-foreground">
          tRPC rate limited:{" "}
          <span
            className={
              data.trpcRateLimited > 0
                ? "font-medium text-yellow-500"
                : "font-medium text-foreground"
            }
          >
            {data.trpcRateLimited.toLocaleString()}
          </span>
        </p>
      </section>
    </div>
  );
};

export default Dashboard;
