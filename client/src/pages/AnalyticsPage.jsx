import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, CartesianGrid } from "recharts";
import { getAnalyticsMetrics } from "../app/firestoreService";
import DataStateBanner from "../components/DataStateBanner";
import { Card, CardHeader } from "../components/ui/Card";

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    cards: [],
    trend: [],
    distribution: []
  });
  const [analyticsState, setAnalyticsState] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    let active = true;

    getAnalyticsMetrics()
      .then((data) => {
        if (active) {
          setAnalyticsData({
            cards: data.cards ?? [],
            trend: data.trend ?? [],
            distribution: data.distribution ?? []
          });
          setAnalyticsState({ loading: false, error: "" });
        }
      })
      .catch(() => {
        if (active) {
          setAnalyticsState({
            loading: false,
            error: "Could not load analytics from Firebase right now."
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader
          eyebrow="Analytics & Reports"
          title="Sprint 7 performance intelligence"
          description="Visualize module distribution, burndown trends, and outcome quality in one analytics suite."
        />
      </Card>

      <DataStateBanner loading={analyticsState.loading} error={analyticsState.error} loadingText="Loading analytics..." />

      <section className="grid gap-4 xl:grid-cols-4">
        {analyticsData.cards.map((card) => (
          <Card key={card.label} className="p-5">
            <h3 className="text-3xl font-bold text-white">{card.value}</h3>
            <p className="mt-2 text-sm text-slate-400">{card.label}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader title="Burn-down chart" />
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
        </Card>

        <Card>
          <CardHeader title="Requirements by module" />
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
        </Card>
      </section>
    </div>
  );
}

export default AnalyticsPage;
