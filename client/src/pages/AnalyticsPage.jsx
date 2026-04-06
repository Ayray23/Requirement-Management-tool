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
          setAnalyticsState({
            loading: false,
            error: ""
          });
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
    <div className="page-grid">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Analytics & Reports</p>
          <h1>Sprint 7 performance intelligence</h1>
          <p className="muted">Visualize module distribution, burndown trends, and outcome quality in one analytics suite.</p>
        </div>
      </section>
      <DataStateBanner loading={analyticsState.loading} error={analyticsState.error} loadingText="Loading analytics..." />

      <section className="mini-grid">
        {analyticsData.cards.map((card) => (
          <article className="mini-card" key={card.label}>
            <h3>{card.value}</h3>
            <p>{card.label}</p>
          </article>
        ))}
      </section>

      <section className="two-column">
        <article className="panel chart-panel">
          <div className="panel-header">
            <h3>Burn-down chart</h3>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
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

        <article className="panel chart-panel">
          <div className="panel-header">
            <h3>Requirements by module</h3>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
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
