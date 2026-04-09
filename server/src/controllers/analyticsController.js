import { buildAnalyticsMetrics } from "../services/metricsService.js";

export async function getAnalytics(req, res, next) {
  try {
    const metrics = await buildAnalyticsMetrics();

    res.json({
      ok: true,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
}
