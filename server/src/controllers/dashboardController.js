import { dashboardSummary, requirements } from "../data/mockData.js";

export function getDashboard(req, res) {
  res.json({
    ok: true,
    data: {
      summary: dashboardSummary,
      featuredRequirements: requirements
    }
  });
}
