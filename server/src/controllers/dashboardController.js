import { buildDashboardMetrics } from "../services/metricsService.js";

export async function getDashboard(req, res, next) {
  try {
    const metrics = await buildDashboardMetrics();

    res.json({
      ok: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
}
