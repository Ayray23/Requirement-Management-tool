import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, CartesianGrid } from "recharts";
import { getAnalyticsData } from "../app/api";
import DataStateBanner from "../components/DataStateBanner";
import { analyticsCards, analyticsModules, analyticsTrend } from "../data/mockData";

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    cards: analyticsCards,
    trend: analyticsTrend,
    distribution: analyticsModules
  });
  const [analyticsState, setAnalyticsState] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    let active = true;

    getAnalyticsData()
      .then((data) => {
        if (active) {
          setAnalyticsData({
            cards: data.cards ?? analyticsCards,
            trend: data.trend ?? analyticsTrend,
            distribution: data.distribution ?? analyticsModules
          });
          setAnalyticsState({ loading: false, error: "" });
        }
      })
      .catch(() => {
        if (active) {
          setAnalyticsState({
            loading: false,
            error: "Analytics service is offline right now, so this page is showing demo metrics."
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid gap-5">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Analytics & Reports</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white">Sprint 7 performance intelligence</h1>
        <p className="mt-3 text-slate-400">Visualize module distribution, burndown trends, and outcome quality in one analytics suite.</p>
      </section>

      <DataStateBanner loading={analyticsState.loading} error={analyticsState.error} loadingText="Loading analytics..." />

      <section className="grid gap-4 xl:grid-cols-4">
        {analyticsData.cards.map((card) => (
          <article key={card.label} className="rounded-[24px] border border-white/10 bg-slate-950/50 p-5 shadow-glow">
            <h3 className="text-3xl font-bold text-white">{card.value}</h3>
            <p className="mt-2 text-sm text-slate-400">{card.label}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-glow backdrop-blur-xl">
          <h3 className="text-2xl font-semibold text-white">Burn-down chart</h3>
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.trend}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis dataKey="name" stroke="#8b9cc0" />
                <YAxis stroke="#8b9cc0" />
                <Tooltip />
                <Line dataKey="ideal" stroke="#22d3ee" strokeWidth={3} dot={false} />
                <Line dataKey="actual" stroke="#ff8b36" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-glow backdrop-blur-xl">
          <h3 className="text-2xl font-semibold text-white">Requirements by module</h3>
          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.distribution}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis dataKey="name" stroke="#8b9cc0" />
                <YAxis stroke="#8b9cc0" />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
}

export default AnalyticsPage;
