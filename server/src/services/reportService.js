import { buildAnalyticsMetrics, buildDashboardMetrics } from "./metricsService.js";
import { listRequirements } from "./requirementStore.js";

function formatRequirementsTable(requirements) {
  if (requirements.length === 0) {
    return "No requirements available.\n";
  }

  const header = "ID | Title | Module | Priority | Status | Owner | Progress";
  const divider = "---|---|---|---|---|---|---";
  const rows = requirements.map(
    (requirement) =>
      `${requirement.id} | ${requirement.title} | ${requirement.module} | ${requirement.priority} | ${requirement.status} | ${requirement.owner} | ${requirement.progress}%`
  );

  return [header, divider, ...rows].join("\n");
}

export async function buildProjectSummaryReport() {
  const [dashboard, analytics, requirements] = await Promise.all([
    buildDashboardMetrics(),
    buildAnalyticsMetrics(),
    listRequirements()
  ]);

  const createdAt = new Date().toLocaleString("en-NG", {
    dateStyle: "full",
    timeStyle: "short"
  });

  return `# REMT Project Summary Report

Generated: ${createdAt}
Active Sprint: ${dashboard.summary.activeSprint}
Completion Health: ${dashboard.summary.completionRate}%
Stakeholder Confidence: ${dashboard.summary.stakeholderSatisfaction}%

## KPI Snapshot
${dashboard.kpis.map((item) => `- ${item.label}: ${item.value} (${item.delta})`).join("\n")}

## AI Insights
${dashboard.insights.map((item) => `- ${item}`).join("\n")}

## Status Distribution
${analytics.cards.map((item) => `- ${item.label}: ${item.value}`).join("\n")}

## Module Distribution
${analytics.distribution.map((item) => `- ${item.name}: ${item.count}`).join("\n")}

## Priority Requirements
${dashboard.featuredRequirements.map((item) => `- ${item.id}: ${item.title} [${item.priority}] - ${item.status}`).join("\n")}

## Requirement Register
${formatRequirementsTable(requirements)}
`;
}
