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
    progress: 78,
    description:
      "The platform must support OAuth 2.0 authentication with Google, Microsoft, and GitHub providers. Users should sign in with a single click, have profile data prefilled, and maintain secure sessions with refresh-token support.",
    acceptanceCriteria: [
      "Users can sign in using Google, Microsoft, and GitHub.",
      "OAuth flows comply with PKCE and secure redirect handling.",
      "Session tokens expire after 24 hours and refresh without breaking the user session."
    ],
    dependencies: ["Identity provider setup", "Security review", "Session management service"]
  },
  {
    id: "REQ-002",
    title: "Real-time Notifications with WebSocket Support",
    module: "Collaboration",
    priority: "High",
    status: "In Progress",
    owner: "Sarah Kim",
    sprint: "Sprint 7",
    progress: 80,
    description:
      "The application must support real-time notifications across requirement updates, comments, and sprint changes so team members can collaborate without manual refresh.",
    acceptanceCriteria: [
      "Users receive live notifications for comments and status changes.",
      "Notification delivery works across dashboard and requirement detail views.",
      "Failed notification attempts are retried gracefully."
    ],
    dependencies: ["WebSocket or Firebase messaging layer", "Notification preferences", "Activity feed"]
  },
  {
    id: "REQ-003",
    title: "Multi-language i18n Support",
    module: "Experience",
    priority: "Medium",
    status: "Backlog",
    owner: "Maria Liu",
    sprint: "Sprint 8",
    progress: 22,
    description:
      "The product should support multiple interface languages so global teams can use the platform without language barriers.",
    acceptanceCriteria: [
      "Users can switch interface language from settings.",
      "Core navigation and requirement views are translatable.",
      "Translation keys are structured for future language additions."
    ],
    dependencies: ["Translation file structure", "Locale switching", "QA review"]
  },
  {
    id: "REQ-004",
    title: "Export Reports in PDF, CSV, and Excel",
    module: "Reporting",
    priority: "Medium",
    status: "Completed",
    owner: "James Torres",
    sprint: "Sprint 6",
    progress: 100,
    description:
      "Stakeholders should be able to export requirement reports in PDF, CSV, and Excel to support academic documentation and delivery handoff.",
    acceptanceCriteria: [
      "Exports generate successfully for all supported formats.",
      "Report data includes requirement metadata and sprint status.",
      "Downloads work on current desktop browsers."
    ],
    dependencies: ["Report service", "Formatting templates", "Validation tests"]
  },
  {
    id: "REQ-005",
    title: "AI-Powered Requirement Conflict Detection",
    module: "Intelligence",
    priority: "Critical",
    status: "Blocked",
    owner: "Alex Morgan",
    sprint: "Sprint 7",
    progress: 45,
    description:
      "The platform should detect duplicate, ambiguous, and conflicting requirements using a rules-first intelligence layer with optional AI suggestions.",
    acceptanceCriteria: [
      "Conflicting requirements are flagged before approval.",
      "The system explains the reason for each conflict alert.",
      "Users can review similar and overlapping requirements from the workbench."
    ],
    dependencies: ["Requirement similarity model", "Conflict rules engine", "Review workflow"]
  },
  {
    id: "REQ-006",
    title: "Role-Based Access Control Across All Modules",
    module: "Security",
    priority: "High",
    status: "In Progress",
    owner: "James Torres",
    sprint: "Sprint 7",
    progress: 69,
    description:
      "Role-based access control should govern all product modules so stakeholders, analysts, and developers only see and edit the data they are allowed to manage.",
    acceptanceCriteria: [
      "Roles restrict editing permissions by module.",
      "Protected routes prevent unauthorized access.",
      "Audit logs capture permission-sensitive actions."
    ],
    dependencies: ["Auth middleware", "Role matrix", "Admin controls"]
  }
];

export const requirementActivity = [
  { id: "a1", requirementId: "REQ-001", text: "Security review requested additional scope validation.", time: "2 hours ago" },
  { id: "a2", requirementId: "REQ-001", text: "OAuth provider list updated with Microsoft support.", time: "Yesterday" },
  { id: "a3", requirementId: "REQ-002", text: "Notification retry strategy added to implementation notes.", time: "Today" },
  { id: "a4", requirementId: "REQ-005", text: "Conflict detection logic blocked pending model decision.", time: "3 days ago" }
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
    id: "thread-001",
    title: "OAuth scope alignment for REQ-001",
    tag: "REQ-001",
    participants: 4,
    owner: "Sarah Kim",
    status: "Needs Review",
    updatedAt: "10 minutes ago",
    excerpt: "This is blocking security review. We need a final provider list before implementation continues."
  },
  {
    id: "thread-002",
    title: "Notification delivery strategy",
    tag: "REQ-002",
    participants: 3,
    owner: "Maria Liu",
    status: "In Discussion",
    updatedAt: "35 minutes ago",
    excerpt: "Team is comparing Socket.IO against Firebase messaging for live updates."
  },
  {
    id: "thread-003",
    title: "Conflict detection model choice",
    tag: "REQ-005",
    participants: 5,
    owner: "Alex Morgan",
    status: "Escalated",
    updatedAt: "Today",
    excerpt: "The AI assistant recommends a rules-first approach before adding generative summarization."
  }
];

export const collaborationMembers = [
  { name: "Alex Morgan", role: "Admin", focus: "Governance and delivery approvals" },
  { name: "Sarah Kim", role: "Analyst", focus: "Flows, UX, and requirement refinement" },
  { name: "Maria Liu", role: "Stakeholder", focus: "Business goals and acceptance criteria" },
  { name: "James Torres", role: "Developer", focus: "Architecture, security, and implementation" }
];
