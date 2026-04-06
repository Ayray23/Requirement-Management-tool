export const dashboardSummary = {
  productName: "REMT",
  activeSprint: "Sprint 7",
  completionRate: 82,
  ambiguityAlerts: 7,
  stakeholderSatisfaction: 96
};

export const dashboardKpis = [
  { label: "Total Requirements", value: "128", delta: "+14 this sprint", tone: "indigo", icon: "RF" },
  { label: "Completion Rate", value: "82%", delta: "+18% vs last sprint", tone: "cyan", icon: "CP" },
  { label: "Conflicts Resolved", value: "19", delta: "5 AI assisted", tone: "green", icon: "AI" },
  { label: "Stakeholder Satisfaction", value: "96%", delta: "Excellent feedback", tone: "amber", icon: "CS" }
];

export const requirements = [
  {
    id: "REQ-001",
    title: "User Authentication System with OAuth 2.0 Integration",
    status: "In Review",
    priority: "Critical",
    module: "Access Control",
    owner: "Alex Morgan",
    progress: 78
  },
  {
    id: "REQ-002",
    title: "Real-time Notifications with WebSocket Support",
    status: "In Progress",
    priority: "High",
    module: "Collaboration",
    owner: "Sarah Kim",
    progress: 80
  },
  {
    id: "REQ-005",
    title: "AI-Powered Requirement Conflict Detection",
    status: "Blocked",
    priority: "Critical",
    module: "Intelligence",
    owner: "Alex Morgan",
    progress: 45
  }
];

export const timeline = [
  "REQ-042 marked as complete by Maria Liu",
  "New stakeholder comment added to REQ-039",
  "REQ-031 priority increased to Critical",
  "REQ-028 flagged as blocker by QA",
  "5 requirements imported from Jira"
];

export const insights = [
  "Completion rate increased by 18% compared to Sprint 6.",
  "The AI engine flagged 7 ambiguous requirements for refinement.",
  "Sarah Kim leads team velocity with 14 requirements closed."
];

export const analytics = {
  cards: [
    { label: "Open", value: 48 },
    { label: "In Progress", value: 37 },
    { label: "In Review", value: 21 },
    { label: "Completed", value: 22 }
  ],
  trend: [
    { name: "Week 1", ideal: 100, actual: 96 },
    { name: "Week 2", ideal: 82, actual: 78 },
    { name: "Week 3", ideal: 60, actual: 56 },
    { name: "Week 4", ideal: 34, actual: 31 },
    { name: "Week 5", ideal: 14, actual: 18 }
  ],
  distribution: [
    { name: "Dashboard", count: 31 },
    { name: "Requirements", count: 29 },
    { name: "Analytics", count: 18 },
    { name: "Collaboration", count: 22 },
    { name: "Security", count: 28 }
  ]
};
