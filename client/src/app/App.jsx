import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, CartesianGrid } from "recharts";
import {
  BarChart3,
  Bell,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users
} from "./icons";
import {
  analyticsCards,
  analyticsModules,
  analyticsTrend,
  collaborationThreads,
  insights,
  kpis,
  requirements,
  timeline,
  userProfile
} from "../data/mockData";
import { createRequirement, getAnalyticsData, getDashboardData, getRequirementsData } from "./api";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/requirements", label: "Requirements", icon: ClipboardList },
  { to: "/workbench", label: "AI Workbench", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings }
];

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <Shell>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/requirements" element={<RequirementsPage />} />
              <Route path="/workbench" element={<WorkbenchPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Shell>
        }
      />
    </Routes>
  );
}

function LoginPage() {
  return (
    <main className="auth-page">
      <section className="hero-panel">
        <div className="brand-mark">R</div>
        <span className="brand-title">REMT Platform</span>
        <h1>
          Elicit. Manage.
          <br />
          <span>Ship requirements with confidence.</span>
        </h1>
        <p>
          A smart requirement elicitation and management tool for capturing stakeholder needs, tracking delivery
          readiness, and presenting final-year work like a real product team built it.
        </p>
        <div className="hero-stats">
          <Stat label="Active Projects" value="12" />
          <Stat label="Conflict Alerts" value="07" />
          <Stat label="Team Velocity" value="96%" />
        </div>
        <div className="hero-note">
          <Sparkles />
          <div>REMT AI identified 3 ambiguous requirements in Sprint 7 and suggested refinements before development.</div>
        </div>
      </section>
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to your workspace</h2>
        <p className="muted">Prototype-ready auth screen matching the provided design language.</p>
        <div className="input-group">
          <label>Email address</label>
          <input defaultValue="alex.morgan@techcorp.io" />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" defaultValue="password123" />
        </div>
        <NavLink className="primary-button" to="/dashboard">
          Enter workspace
          <ChevronRight />
        </NavLink>
        <button className="secondary-button" type="button">
          Continue with Google
        </button>
      </section>
    </main>
  );
}

function Shell({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">R</div>
          <div>
            <strong>REMT</strong>
            <p>Requirement Intelligence</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                <Icon />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-user">
          <div className="avatar">{userProfile.initials}</div>
          <div>
            <strong>{userProfile.name}</strong>
            <p>{userProfile.role}</p>
          </div>
        </div>
      </aside>
      <section className="app-main">
        <header className="topbar">
          <div>
            <h3>Smart Requirement Elicitation & Management Tool</h3>
            <p>Final Year Project Workspace</p>
          </div>
          <div className="topbar-actions">
            <div className="search-box">Search requirements, projects, teams</div>
            <button className="icon-button" type="button">
              <Bell />
            </button>
            <button className="icon-button" type="button">
              <Users />
            </button>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </section>
    </div>
  );
}

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    kpis,
    timeline,
    insights
  });
  const [dashboardState, setDashboardState] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    let active = true;

    getDashboardData()
      .then((data) => {
        if (active) {
          setDashboardData({
            kpis: data.kpis ?? kpis,
            timeline: data.timeline ?? timeline,
            insights: data.insights ?? insights
          });
          setDashboardState({
            loading: false,
            error: ""
          });
        }
      })
      .catch(() => {
        if (active) {
          setDashboardState({
            loading: false,
            error: "Live dashboard data is unavailable, so demo data is being shown."
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-grid">
      <section className="page-header-card spotlight">
        <div>
          <p className="eyebrow">Executive Dashboard</p>
          <h1>Build a requirement platform that looks production-ready.</h1>
          <p className="muted">
            The dashboard combines sprint health, requirement throughput, and AI-assisted delivery insights in one view.
          </p>
        </div>
        <div className="header-actions">
          <button className="secondary-button" type="button">
            Export report
          </button>
          <NavLink className="primary-button compact" to="/workbench">
            New requirement
          </NavLink>
        </div>
      </section>
      <DataStateBanner loading={dashboardState.loading} error={dashboardState.error} loadingText="Loading dashboard insights..." />

      <section className="kpi-grid">
        {dashboardData.kpis.map((item) => (
          <article key={item.label} className={`kpi-card ${item.tone}`}>
            <div className="kpi-icon">{item.icon}</div>
            <h2>{item.value}</h2>
            <h4>{item.label}</h4>
            <p>{item.delta}</p>
          </article>
        ))}
      </section>

      <section className="two-column">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Live Activity</p>
              <h3>Sprint updates</h3>
            </div>
          </div>
          <div className="timeline-list">
            {dashboardData.timeline.map((item) => (
              <div key={item} className="timeline-item">
                <span className="timeline-dot" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel accent-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">AI Assistant</p>
              <h3>Recommended actions</h3>
            </div>
          </div>
          {dashboardData.insights.map((item) => (
            <div key={item} className="insight-item">
              <Sparkles />
              <p>{item}</p>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
}

function RequirementsPage() {
  const [requirementsData, setRequirementsData] = useState(requirements);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [requirementsState, setRequirementsState] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    let active = true;

    getRequirementsData()
      .then((data) => {
        if (active && Array.isArray(data)) {
          setRequirementsData(data);
          setRequirementsState({
            loading: false,
            error: ""
          });
        }
      })
      .catch(() => {
        if (active) {
          setRequirementsState({
            loading: false,
            error: "Could not reach the API, so the seeded requirement list is being shown."
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const summary = {
    total: requirementsData.length,
    active: requirementsData.filter((item) => item.status !== "Completed").length,
    critical: requirementsData.filter((item) => item.priority === "Critical").length
  };

  const filteredRequirements = requirementsData.filter((requirement) => {
    const matchesSearch = [requirement.id, requirement.title, requirement.module, requirement.owner]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "All" || requirement.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const availableStatuses = ["All", ...new Set(requirementsData.map((item) => item.status))];

  return (
    <div className="page-grid">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Requirements Repository</p>
          <h1>All requirements</h1>
          <p className="muted">Table-style requirement management with clear status, ownership, and sprint alignment.</p>
        </div>
      </section>
      <DataStateBanner
        loading={requirementsState.loading}
        error={requirementsState.error}
        loadingText="Loading requirement records..."
      />
      <section className="requirements-toolbar">
        <div className="summary-row">
          <article className="summary-chip">
            <strong>{summary.total}</strong>
            <span>Total requirements</span>
          </article>
          <article className="summary-chip">
            <strong>{summary.active}</strong>
            <span>Active items</span>
          </article>
          <article className="summary-chip">
            <strong>{summary.critical}</strong>
            <span>Critical priority</span>
          </article>
        </div>
        <div className="filter-row">
          <input
            className="filter-input"
            type="text"
            placeholder="Search by title, ID, module, or owner"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <select className="filter-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {availableStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </section>
      <section className="panel table-panel">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Module</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequirements.map((requirement) => (
              <tr key={requirement.id}>
                <td>{requirement.id}</td>
                <td>{requirement.title}</td>
                <td>{requirement.module}</td>
                <td>
                  <span className={`pill ${requirement.priority.toLowerCase()}`}>{requirement.priority}</span>
                </td>
                <td>{requirement.status}</td>
                <td>{requirement.owner}</td>
                <td>{requirement.progress}%</td>
              </tr>
            ))}
            {filteredRequirements.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-table-state">No requirements match the current search and filter.</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function WorkbenchPage() {
  const initialForm = {
    title: "User Authentication System with OAuth 2.0 Integration",
    priority: "Critical",
    module: "Access Control",
    sprint: "Sprint 7",
    description:
      "The system must support OAuth 2.0 authentication with Google, Microsoft, and GitHub providers. Users should log in with a single click, and session tokens should expire after 24 hours with refresh support."
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitState, setSubmitState] = useState({
    status: "idle",
    message: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitState({
      status: "loading",
      message: "Creating requirement..."
    });

    try {
      const createdRequirement = await createRequirement({
        ...formData,
        owner: userProfile.name
      });

      setSubmitState({
        status: "success",
        message: `${createdRequirement.id} created successfully and assigned to ${createdRequirement.owner}.`
      });
      setFormData(initialForm);
    } catch (error) {
      setSubmitState({
        status: "error",
        message: "Could not create the requirement right now. Check the API and try again."
      });
    }
  }

  return (
    <div className="workbench-layout">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">AI Workbench</p>
            <h3>Create or refine a requirement</h3>
          </div>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Requirement title</label>
            <input name="title" value={formData.title} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Priority</label>
            <input name="priority" value={formData.priority} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Module</label>
            <input name="module" value={formData.module} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Sprint</label>
            <input name="sprint" value={formData.sprint} onChange={handleChange} />
          </div>
          <div className="input-group full">
            <label>Description</label>
            <textarea
              name="description"
              rows="8"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="form-actions full">
            <button className="secondary-button inline-button" type="button" onClick={() => setFormData(initialForm)}>
              Reset form
            </button>
            <button className="primary-button inline-button" type="submit" disabled={submitState.status === "loading"}>
              {submitState.status === "loading" ? "Saving..." : "Create requirement"}
            </button>
          </div>
          {submitState.message ? (
            <div className={`form-status ${submitState.status}`}>
              <p>{submitState.message}</p>
            </div>
          ) : null}
        </form>
      </section>
      <aside className="panel accent-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Smart Assist</p>
            <h3>Conflict and similarity alerts</h3>
          </div>
        </div>
        <div className="insight-item">
          <Sparkles />
          <p>REQ-019 contains overlapping session management rules that may conflict with this requirement.</p>
        </div>
        {collaborationThreads.map((thread) => (
          <article key={thread.title} className="thread-card">
            <small>{thread.tag}</small>
            <h4>{thread.title}</h4>
            <p>{thread.excerpt}</p>
            <span>{thread.participants} participants</span>
          </article>
        ))}
      </aside>
    </div>
  );
}

function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    cards: analyticsCards,
    trend: analyticsTrend,
    distribution: analyticsModules
  });
  const [analyticsState, setAnalyticsState] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    let active = true;

    getAnalyticsData()
      .then((data) => {
        if (active) {
          setAnalyticsData({
            cards: data.cards ?? analyticsCards,
            trend: data.trend ?? analyticsTrend,
            distribution: data.distribution ?? analyticsModules
          });
          setAnalyticsState({
            loading: false,
            error: ""
          });
        }
      })
      .catch(() => {
        if (active) {
          setAnalyticsState({
            loading: false,
            error: "Analytics service is offline right now, so this page is showing demo metrics."
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="page-grid">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Analytics & Reports</p>
          <h1>Sprint 7 performance intelligence</h1>
          <p className="muted">Visualize module distribution, burndown trends, and outcome quality in one analytics suite.</p>
        </div>
      </section>
      <DataStateBanner loading={analyticsState.loading} error={analyticsState.error} loadingText="Loading analytics..." />

      <section className="mini-grid">
        {analyticsData.cards.map((card) => (
          <article className="mini-card" key={card.label}>
            <h3>{card.value}</h3>
            <p>{card.label}</p>
          </article>
        ))}
      </section>

      <section className="two-column">
        <article className="panel chart-panel">
          <div className="panel-header">
            <h3>Burn-down chart</h3>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={analyticsData.trend}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis dataKey="name" stroke="#8b9cc0" />
                <YAxis stroke="#8b9cc0" />
                <Tooltip />
                <Line dataKey="ideal" stroke="#22d3ee" strokeWidth={3} dot={false} />
                <Line dataKey="actual" stroke="#ff8b36" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel chart-panel">
          <div className="panel-header">
            <h3>Requirements by module</h3>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analyticsData.distribution}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                <XAxis dataKey="name" stroke="#8b9cc0" />
                <YAxis stroke="#8b9cc0" />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="two-column">
      <article className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Profile</p>
            <h3>Workspace identity</h3>
          </div>
        </div>
        <div className="form-grid">
          <div className="input-group">
            <label>Full name</label>
            <input defaultValue={userProfile.name} />
          </div>
          <div className="input-group">
            <label>Role</label>
            <input defaultValue={userProfile.role} />
          </div>
          <div className="input-group full">
            <label>Email</label>
            <input defaultValue={userProfile.email} />
          </div>
          <div className="input-group full">
            <label>Bio</label>
            <textarea rows="5" defaultValue="Senior Product Owner with 6+ years in agile software delivery and requirement engineering." />
          </div>
        </div>
      </article>
      <article className="panel accent-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Preferences</p>
            <h3>Notification controls</h3>
          </div>
        </div>
        {["Email notifications", "Requirement status changes", "AI conflict alerts", "Weekly summary digest"].map((item) => (
          <div key={item} className="toggle-row">
            <div>
              <strong>{item}</strong>
              <p>Enabled for this workspace</p>
            </div>
            <span className="toggle-pill">On</span>
          </div>
        ))}
      </article>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function DataStateBanner({ loading, error, loadingText }) {
  if (loading) {
    return <div className="data-banner info">{loadingText}</div>;
  }

  if (error) {
    return <div className="data-banner warning">{error}</div>;
  }

  return <div className="data-banner success">Live data connected successfully.</div>;
}

export default App;
