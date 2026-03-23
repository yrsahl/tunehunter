import { api } from "@/lib/api";
import { getCountryName } from "@/lib/validators";
import type { NextPage } from "next";

const Insights: NextPage = () => {
  const { data: insights, isLoading } = api.stats.getInsights.useQuery(undefined, { staleTime: 5 * 60 * 1000 });

  if (isLoading) return <div className="p-10 text-muted-foreground">Loading...</div>;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 p-8">
      <h1 className="text-2xl font-semibold">Insights</h1>

      {/* Top artists + top regions */}
      {insights && (insights.topArtists.length > 0 || insights.topRegions.length > 0) && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Activity
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {insights.topArtists.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top artists</h3>
                <ol className="flex flex-col divide-y divide-primary/5 text-sm">
                  {insights.topArtists.map((a, i) => (
                    <li key={a.name} className="flex items-center justify-between py-2">
                      <span>
                        <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                        {a.name}
                      </span>
                      <span className="text-muted-foreground">{Number(a.searches).toLocaleString()}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {insights.topRegions.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Top regions</h3>
                <ol className="flex flex-col divide-y divide-primary/5 text-sm">
                  {insights.topRegions.map((r, i) => (
                    <li key={r.region} className="flex items-center justify-between py-2">
                      <span>
                        <span className="mr-2 text-muted-foreground">{i + 1}.</span>
                        {getCountryName(r.region) ?? r.region}
                      </span>
                      <span className="text-muted-foreground">{Number(r.searches).toLocaleString()}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {(!insights || (insights.topArtists.length === 0 && insights.topRegions.length === 0)) && (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      )}
    </div>
  );
};

export default Insights;
