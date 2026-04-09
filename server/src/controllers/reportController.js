import { buildProjectSummaryReport } from "../services/reportService.js";

export async function downloadProjectSummaryReport(req, res, next) {
  try {
    const report = await buildProjectSummaryReport();

    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="remt-project-summary.md"');
    res.send(report);
  } catch (error) {
    next(error);
  }
}
