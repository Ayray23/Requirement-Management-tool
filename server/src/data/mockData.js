export const dashboardSummary = {
  productName: "REMT",
  activeSprint: "Sprint 7",
  completionRate: 82,
  ambiguityAlerts: 7,
  stakeholderSatisfaction: 96
};

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

export const analytics = {
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
