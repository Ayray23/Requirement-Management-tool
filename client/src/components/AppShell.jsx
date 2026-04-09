import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import { Bell, Users, BarChart3, ClipboardList, LayoutDashboard, Settings, Sparkles } from "../app/icons";
import Button from "./ui/Button";
import { Card } from "./ui/Card";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/requirements", label: "Requirements", icon: ClipboardList },
  { to: "/workbench", label: "AI Workbench", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings }
];

function AppShell({ children }) {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const profile = session.user;

  return (
    <div className="min-h-screen bg-remt-bg bg-remt-scene font-body text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl">
          <Card className="rounded-3xl bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-remt-brand font-display text-xl font-bold text-white">
                R
              </div>
              <div>
                <strong className="block text-sm font-bold">REMT</strong>
                <p className="text-xs text-slate-400">Requirement Intelligence</p>
              </div>
            </div>
          </Card>

          <nav className="mt-6 grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "border-fuchsia-400/25 bg-remt-brand-soft text-white"
                        : "border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/5"
                    }`
                  }
                >
                  <Icon />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <Card className="mt-8 rounded-3xl bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-400 font-bold text-white">
                {profile?.initials ?? "RM"}
              </div>
              <div>
                <strong className="block text-sm">{profile?.name ?? "Workspace User"}</strong>
                <p className="text-xs text-slate-400">{profile?.role ?? "Guest"}</p>
              </div>
            </div>
          </Card>
        </aside>

        <section className="p-4 sm:p-6">
          <Card className="mb-5 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Smart Requirement Elicitation & Management Tool</h3>
                <p className="text-sm text-slate-400">Final Year Project Workspace</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
                  Search requirements, projects, teams
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="icon" size="icon">
                    <Bell />
                  </Button>
                  <Button type="button" variant="icon" size="icon">
                    <Users />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      signOut();
                      navigate("/");
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          <div className="grid gap-5">{children}</div>
        </section>
      </div>
    </div>
  );
}

export default AppShell;
