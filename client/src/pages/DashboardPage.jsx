import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Sparkles } from "../app/icons";
import { getDashboardData } from "../app/api";
import DataStateBanner from "../components/DataStateBanner";
import { insights, kpis, timeline } from "../data/mockData";

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    kpis,
    timeline,
    insights
  });
  const [dashboardState, setDashboardState] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    let active = true;

    getDashboardData()
      .then((data) => {
        if (active) {
          setDashboardData({
            kpis: data.kpis ?? kpis,
            timeline: data.timeline ?? timeline,
            insights: data.insights ?? insights
          });
          setDashboardState({
            loading: false,
            error: ""
          });
        }
      })
      .catch(() => {
        if (active) {
          setDashboardState({
            loading: false,
            error: "Live dashboard data is unavailable, so demo data is being shown."
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-grid">
      <section className="page-header-card spotlight">
        <div>
          <p className="eyebrow">Executive Dashboard</p>
          <h1>Build a requirement platform that looks production-ready.</h1>
          <p className="muted">
            The dashboard combines sprint health, requirement throughput, and AI-assisted delivery insights in one view.
          </p>
        </div>
        <div className="header-actions">
          <button className="secondary-button" type="button">
            Export report
          </button>
          <NavLink className="primary-button compact" to="/workbench">
            New requirement
          </NavLink>
        </div>
      </section>
      <DataStateBanner loading={dashboardState.loading} error={dashboardState.error} loadingText="Loading dashboard insights..." />

      <section className="kpi-grid">
        {dashboardData.kpis.map((item) => (
          <article key={item.label} className={`kpi-card ${item.tone}`}>
            <div className="kpi-icon">{item.icon}</div>
            <h2>{item.value}</h2>
            <h4>{item.label}</h4>
            <p>{item.delta}</p>
          </article>
        ))}
      </section>

      <section className="two-column">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Live Activity</p>
              <h3>Sprint updates</h3>
            </div>
          </div>
          <div className="timeline-list">
            {dashboardData.timeline.map((item) => (
              <div key={item} className="timeline-item">
                <span className="timeline-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel accent-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">AI Assistant</p>
              <h3>Recommended actions</h3>
            </div>
          </div>
          {dashboardData.insights.map((item) => (
            <div key={item} className="insight-item">
              <Sparkles />
              <p>{item}</p>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
