export const userProfile = {
  name: "Alex Morgan",
  role: "Senior Product Owner",
  email: "alex.morgan@techcorp.io",
  team: "Platform Strategy",
  initials: "AM"
};

export const kpis = [
  { label: "Total Requirements", value: "128", delta: "+14 this sprint", tone: "indigo", icon: "RF" },
  { label: "Completion Rate", value: "82%", delta: "+18% vs last sprint", tone: "cyan", icon: "CP" },
  { label: "Conflicts Resolved", value: "19", delta: "5 AI assisted", tone: "green", icon: "AI" },
  { label: "Stakeholder Satisfaction", value: "96%", delta: "Excellent feedback", tone: "amber", icon: "CS" }
];

export const requirements = [
  {
    id: "REQ-001",
    title: "User Authentication System with OAuth 2.0 Integration",
    module: "Access Control",
    priority: "Critical",
    status: "In Review",
    owner: "Alex Morgan",
    sprint: "Sprint 7",
    progress: 78
  },
  {
    id: "REQ-002",
    title: "Real-time Notifications with WebSocket Support",
    module: "Collaboration",
    priority: "High",
    status: "In Progress",
    owner: "Sarah Kim",
    sprint: "Sprint 7",
    progress: 80
  },
  {
    id: "REQ-003",
    title: "Multi-language i18n Support",
    module: "Experience",
    priority: "Medium",
    status: "Backlog",
    owner: "Maria Liu",
    sprint: "Sprint 8",
    progress: 22
  },
  {
    id: "REQ-004",
    title: "Export Reports in PDF, CSV, and Excel",
    module: "Reporting",
    priority: "Medium",
    status: "Completed",
    owner: "James Torres",
    sprint: "Sprint 6",
    progress: 100
  },
  {
    id: "REQ-005",
    title: "AI-Powered Requirement Conflict Detection",
    module: "Intelligence",
    priority: "Critical",
    status: "Blocked",
    owner: "Alex Morgan",
    sprint: "Sprint 7",
    progress: 45
  },
  {
    id: "REQ-006",
    title: "Role-Based Access Control Across All Modules",
    module: "Security",
    priority: "High",
    status: "In Progress",
    owner: "James Torres",
    sprint: "Sprint 7",
    progress: 69
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

export const analyticsCards = [
  { label: "Open", value: 48 },
  { label: "In Progress", value: 37 },
  { label: "In Review", value: 21 },
  { label: "Completed", value: 22 }
];

export const analyticsTrend = [
  { name: "Week 1", ideal: 100, actual: 96 },
  { name: "Week 2", ideal: 82, actual: 78 },
  { name: "Week 3", ideal: 60, actual: 56 },
  { name: "Week 4", ideal: 34, actual: 31 },
  { name: "Week 5", ideal: 14, actual: 18 }
];

export const analyticsModules = [
  { name: "Dashboard", count: 31 },
  { name: "Requirements", count: 29 },
  { name: "Analytics", count: 18 },
  { name: "Collaboration", count: 22 },
  { name: "Security", count: 28 }
];

export const collaborationThreads = [
  {
    title: "OAuth scope alignment for REQ-001",
    tag: "REQ-001",
    participants: 4,
    excerpt: "This is blocking security review. We need a final provider list before implementation continues."
  },
  {
    title: "Notification delivery strategy",
    tag: "REQ-002",
    participants: 3,
    excerpt: "Team is comparing Socket.IO against Firebase messaging for live updates."
  },
  {
    title: "Conflict detection model choice",
    tag: "REQ-005",
    participants: 5,
    excerpt: "The AI assistant recommends a rules-first approach before adding generative summarization."
  }
];
