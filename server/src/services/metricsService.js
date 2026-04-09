import { listRequirements } from "./requirementStore.js";

function toInteger(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function averageProgress(requirements) {
  if (requirements.length === 0) {
    return 0;
  }

  const total = requirements.reduce((sum, requirement) => sum + toInteger(requirement.progress), 0);
  return Math.round(total / requirements.length);
}

function countByStatus(requirements, statuses) {
  return statuses.map((status) => ({
    label: status,
    value: requirements.filter((requirement) => requirement.status === status).length
  }));
}

function groupByModule(requirements) {
  const counts = new Map();

  requirements.forEach((requirement) => {
    const key = requirement.module || "General";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count);
}

function buildTimeline(requirements) {
  return requirements
    .slice()
    .sort((left, right) => toInteger(right.progress) - toInteger(left.progress))
    .slice(0, 5)
    .map((requirement) => `${requirement.id} is ${requirement.status.toLowerCase()} at ${requirement.progress}% progress in ${requirement.sprint}.`);
}

function buildInsights(requirements) {
  const completed = requirements.filter((requirement) => requirement.status === "Completed").length;
  const blocked = requirements.filter((requirement) => requirement.status === "Blocked").length;
  const critical = requirements.filter((requirement) => requirement.priority === "Critical").length;
  const busiestOwner = [...requirements.reduce((map, requirement) => {
    const owner = requirement.owner || "Unassigned";
    map.set(owner, (map.get(owner) ?? 0) + 1);
    return map;
  }, new Map()).entries()].sort((left, right) => right[1] - left[1])[0];

  return [
    `${completed} requirement${completed === 1 ? "" : "s"} have been completed so far.`,
    blocked > 0
      ? `${blocked} requirement${blocked === 1 ? "" : "s"} are currently blocked and need attention.`
      : "No requirements are currently blocked.",
    `${critical} critical requirement${critical === 1 ? "" : "s"} still need close delivery tracking.`,
    busiestOwner ? `${busiestOwner[0]} is currently assigned the largest workload with ${busiestOwner[1]} requirements.` : "No owner workload data is available yet."
  ];
}

function buildBurndownTrend(requirements) {
  const total = Math.max(requirements.length, 1);
  const sorted = requirements.slice().sort((left, right) => toInteger(right.progress) - toInteger(left.progress));
  const checkpoints = [0.2, 0.4, 0.6, 0.8, 1];

  return checkpoints.map((checkpoint, index) => {
    const sliceEnd = Math.max(1, Math.ceil(sorted.length * checkpoint));
    const currentSlice = sorted.slice(0, sliceEnd);
    const actualOutstanding = Math.max(0, total - Math.round((averageProgress(currentSlice) / 100) * total));
    const idealOutstanding = Math.max(0, total - Math.round(total * checkpoint));

    return {
      name: `Week ${index + 1}`,
      ideal: idealOutstanding,
      actual: actualOutstanding
    };
  });
}

export async function buildDashboardMetrics() {
  const requirements = await listRequirements();
  const completionRate = averageProgress(requirements);
  const completedCount = requirements.filter((requirement) => requirement.status === "Completed").length;
  const blockedCount = requirements.filter((requirement) => requirement.status === "Blocked").length;
  const inReviewCount = requirements.filter((requirement) => requirement.status === "In Review").length;
  const total = requirements.length;

  return {
    summary: {
      productName: "REMT",
      activeSprint: "Sprint 7",
      completionRate,
      ambiguityAlerts: blockedCount + inReviewCount,
      stakeholderSatisfaction: Math.max(82, 100 - blockedCount * 4)
    },
    kpis: [
      {
        label: "Total Requirements",
        value: String(total),
        delta: `${requirements.filter((requirement) => requirement.status !== "Completed").length} still active`,
        tone: "indigo",
        icon: "RF"
      },
      {
        label: "Completion Rate",
        value: `${completionRate}%`,
        delta: `${completedCount} completed items`,
        tone: "cyan",
        icon: "CP"
      },
      {
        label: "Blocked Items",
        value: String(blockedCount),
        delta: blockedCount > 0 ? "Needs team attention" : "No blockers right now",
        tone: "amber",
        icon: "BL"
      },
      {
        label: "In Review",
        value: String(inReviewCount),
        delta: "Awaiting approval and sign-off",
        tone: "green",
        icon: "RV"
      }
    ],
    timeline: buildTimeline(requirements),
    insights: buildInsights(requirements),
    featuredRequirements: requirements
      .slice()
      .sort((left, right) => {
        const priorityWeight = { Critical: 3, High: 2, Medium: 1, Low: 0 };
        return (priorityWeight[right.priority] ?? 0) - (priorityWeight[left.priority] ?? 0);
      })
      .slice(0, 4)
  };
}

export async function buildAnalyticsMetrics() {
  const requirements = await listRequirements();

  return {
    cards: countByStatus(requirements, ["Draft", "In Progress", "In Review", "Completed"]),
    trend: buildBurndownTrend(requirements),
    distribution: groupByModule(requirements)
  };
}
