import { dashboardKpis, dashboardSummary, insights, requirements, timeline } from "../data/mockData.js";

export function getDashboard(req, res) {
  res.json({
    ok: true,
    data: {
      summary: dashboardSummary,
      kpis: dashboardKpis,
      timeline,
      insights,
      featuredRequirements: requirements
    }
  });
}
