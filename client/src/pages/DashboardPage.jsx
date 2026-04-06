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
          setDashboardState({ loading: false, error: "" });
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
    <div className="grid gap-5">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-glow backdrop-blur-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Executive Dashboard</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
              Build a requirement platform that looks production-ready.
            </h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              The dashboard combines sprint health, requirement throughput, and AI-assisted delivery insights in one view.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-100" type="button">
              Export report
            </button>
            <NavLink className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 font-semibold text-white" to="/workbench">
              New requirement
            </NavLink>
          </div>
        </div>
      </section>

      <DataStateBanner loading={dashboardState.loading} error={dashboardState.error} loadingText="Loading dashboard insights..." />

      <section className="grid gap-4 xl:grid-cols-4">
        {dashboardData.kpis.map((item) => (
          <article key={item.label} className="rounded-[24px] border border-white/10 bg-slate-950/50 p-6 shadow-glow backdrop-blur-xl">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 font-display text-sm font-bold text-slate-100">
              {item.icon}
            </div>
            <h2 className="mt-5 text-4xl font-bold text-white">{item.value}</h2>
            <h4 className="mt-2 font-semibold text-slate-100">{item.label}</h4>
            <p className="mt-2 text-sm text-slate-400">{item.delta}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-glow backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Live Activity</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Sprint updates</h3>
          <div className="mt-6 grid gap-4">
            {dashboardData.timeline.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-fuchsia-400/20 bg-fuchsia-400/10 p-6 shadow-glow backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-200">AI Assistant</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Recommended actions</h3>
          <div className="mt-6 grid gap-3">
            {dashboardData.insights.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="pt-1 text-fuchsia-200">
                  <Sparkles />
                </div>
                <p className="text-sm leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
