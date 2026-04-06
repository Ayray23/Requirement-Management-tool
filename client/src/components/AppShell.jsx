import { NavLink } from "react-router-dom";
import { Bell, Users, BarChart3, ClipboardList, LayoutDashboard, Settings, Sparkles } from "../app/icons";
import { userProfile } from "../data/mockData";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/requirements", label: "Requirements", icon: ClipboardList },
  { to: "/workbench", label: "AI Workbench", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings }
];

function AppShell({ children }) {
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

export default AppShell;
