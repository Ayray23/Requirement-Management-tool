import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import { canManageRequirements } from "../app/roles";
import { Sparkles } from "../app/icons";
import { downloadProjectSummaryReport } from "../app/api";
import { getDashboardMetrics } from "../app/firestoreService";
import DataStateBanner from "../components/DataStateBanner";
import Button from "../components/ui/Button";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";

function DashboardPage() {
  const { session } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    summary: {
      productName: "REMT",
      activeSprint: "Sprint 7",
      completionRate: 0,
      ambiguityAlerts: 0,
      stakeholderSatisfaction: 0
    },
    kpis: [],
    timeline: [],
    insights: [],
    featuredRequirements: []
  });
  const [dashboardState, setDashboardState] = useState({
    loading: true,
    error: ""
  });
  const [reportState, setReportState] = useState({
    status: "idle",
    message: ""
  });

  useEffect(() => {
    let active = true;

    getDashboardMetrics()
      .then((data) => {
        if (active) {
          setDashboardData({
            summary: data.summary ?? {
              productName: "REMT",
              activeSprint: "Sprint 7",
              completionRate: 0,
              ambiguityAlerts: 0,
              stakeholderSatisfaction: 0,
              portfolioSummary: ""
            },
            kpis: data.kpis ?? [],
            timeline: data.timeline ?? [],
            insights: data.insights ?? [],
            featuredRequirements: data.featuredRequirements ?? []
          });
          setDashboardState({ loading: false, error: "" });
        }
      })
      .catch(() => {
        if (active) {
          setDashboardState({
            loading: false,
            error: "Could not load dashboard data from Firebase right now."
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleExportReport() {
    setReportState({
      status: "loading",
      message: "Preparing project report..."
    });

    try {
      await downloadProjectSummaryReport();
      setReportState({
        status: "success",
        message: "Project summary report downloaded."
      });
    } catch (error) {
      setReportState({
        status: "error",
        message: error.message || "Could not export the project report right now."
      });
    }
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader
          eyebrow="Executive Dashboard"
          title="Build a requirement platform that looks production-ready."
          description="The dashboard combines workflow status, requirement quality, and AI-assisted delivery insights in one view."
          actions={
            <>
              <Button type="button" variant="secondary" onClick={handleExportReport}>
                Export report
              </Button>
              {canManageRequirements(session.user?.role) ? (
                <Button as={NavLink} to="/workbench">
                  New requirement
                </Button>
              ) : null}
            </>
          }
        />
      </Card>

      <DataStateBanner loading={dashboardState.loading} error={dashboardState.error} loadingText="Loading dashboard insights..." />
      {reportState.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
            reportState.status === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
              : reportState.status === "loading"
                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                : "border-red-400/20 bg-red-400/10 text-red-200"
          }`}
        >
          {reportState.message}
        </div>
      ) : null}

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

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Active sprint", value: dashboardData.summary.activeSprint },
          { label: "Completion health", value: `${dashboardData.summary.completionRate}%` },
          { label: "Stakeholder confidence", value: `${dashboardData.summary.stakeholderSatisfaction}%` }
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-bold text-white">{item.value}</p>
          </Card>
        ))}
      </section>

      <Card className="p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Portfolio summary</p>
        <p className="mt-3 text-sm leading-7 text-slate-300">{dashboardData.summary.portfolioSummary}</p>
      </Card>

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

      <Card>
        <CardHeader eyebrow="Priority Focus" title="Requirements that need attention first" />
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {dashboardData.featuredRequirements.length > 0 ? (
            dashboardData.featuredRequirements.map((requirement) => (
              <InfoCard key={requirement.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{requirement.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{requirement.id} - {requirement.module}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">{requirement.priority}</span>
                </div>
                <p className="mt-3 text-sm text-slate-300">{requirement.description}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                  <span>{requirement.status}</span>
                  <span>{requirement.progress}% done</span>
                </div>
              </InfoCard>
            ))
          ) : (
            <InfoCard>
              <p className="text-sm text-slate-300">Requirements will appear here once the project has active records.</p>
            </InfoCard>
          )}
        </div>
      </Card>
    </div>
  );
}

export default DashboardPage;
