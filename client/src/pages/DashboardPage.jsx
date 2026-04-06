import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Sparkles } from "../app/icons";
import { getDashboardData } from "../app/api";
import DataStateBanner from "../components/DataStateBanner";
import { insights, kpis, timeline } from "../data/mockData";
import Button from "../components/ui/Button";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";

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
      <Card>
        <CardHeader
          eyebrow="Executive Dashboard"
          title="Build a requirement platform that looks production-ready."
          description="The dashboard combines sprint health, requirement throughput, and AI-assisted delivery insights in one view."
          actions={
            <>
              <Button type="button" variant="secondary">
                Export report
              </Button>
              <Button as={NavLink} to="/workbench">
                New requirement
              </Button>
            </>
          }
        />
      </Card>

      <DataStateBanner loading={dashboardState.loading} error={dashboardState.error} loadingText="Loading dashboard insights..." />

      <section className="grid gap-4 xl:grid-cols-4">
        {dashboardData.kpis.map((item) => (
          <Card key={item.label} className="p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 font-display text-sm font-bold text-slate-100">
              {item.icon}
            </div>
            <h2 className="mt-5 text-4xl font-bold text-white">{item.value}</h2>
            <h4 className="mt-2 font-semibold text-slate-100">{item.label}</h4>
            <p className="mt-2 text-sm text-slate-400">{item.delta}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader eyebrow="Live Activity" title="Sprint updates" />
          <div className="mt-6 grid gap-4">
            {dashboardData.timeline.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-fuchsia-400/20 bg-fuchsia-400/10">
          <CardHeader eyebrow="AI Assistant" title="Recommended actions" />
          <div className="mt-6 grid gap-3">
            {dashboardData.insights.map((item) => (
              <InfoCard key={item} className="flex gap-3">
                <div className="pt-1 text-fuchsia-200">
                  <Sparkles />
                </div>
                <p className="text-sm leading-7 text-slate-200">{item}</p>
              </InfoCard>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

export default DashboardPage;
