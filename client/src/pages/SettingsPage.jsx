import { userProfile } from "../data/mockData";

function SettingsPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <article className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Profile</p>
        <h3 className="mt-2 text-3xl font-semibold text-white">Workspace identity</h3>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Full name</span>
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-fuchsia-400/40" defaultValue={userProfile.name} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Role</span>
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-fuchsia-400/40" defaultValue={userProfile.role} />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-200">Email</span>
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-fuchsia-400/40" defaultValue={userProfile.email} />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-200">Bio</span>
            <textarea
              className="min-h-[160px] rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-fuchsia-400/40"
              defaultValue="Senior Product Owner with 6+ years in agile software delivery and requirement engineering."
            />
          </label>
        </div>
      </article>

      <article className="rounded-[28px] border border-fuchsia-400/20 bg-fuchsia-400/10 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-200">Preferences</p>
        <h3 className="mt-2 text-3xl font-semibold text-white">Notification controls</h3>

        <div className="mt-6 grid gap-3">
          {["Email notifications", "Requirement status changes", "AI conflict alerts", "Weekly summary digest"].map((item) => (
            <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div>
                <strong className="block text-sm text-white">{item}</strong>
                <p className="mt-1 text-xs text-slate-400">Enabled for this workspace</p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                On
              </span>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export default SettingsPage;
