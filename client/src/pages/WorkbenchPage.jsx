import { useState } from "react";
import { Sparkles } from "../app/icons";
import { createRequirement } from "../app/api";
import { collaborationThreads, userProfile } from "../data/mockData";

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
    setSubmitState({ status: "loading", message: "Creating requirement..." });

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
    } catch {
      setSubmitState({
        status: "error",
        message: "Could not create the requirement right now. Check the API and try again."
      });
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[28px] border border-white/10 bg-slate-950/50 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-300">AI Workbench</p>
        <h3 className="mt-2 text-3xl font-semibold text-white">Create or refine a requirement</h3>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Requirement title</span>
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-fuchsia-400/40" name="title" value={formData.title} onChange={handleChange} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Priority</span>
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-fuchsia-400/40" name="priority" value={formData.priority} onChange={handleChange} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Module</span>
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-fuchsia-400/40" name="module" value={formData.module} onChange={handleChange} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Sprint</span>
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-fuchsia-400/40" name="sprint" value={formData.sprint} onChange={handleChange} />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-medium text-slate-200">Description</span>
            <textarea className="min-h-[220px] rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-fuchsia-400/40" name="description" value={formData.description} onChange={handleChange} />
          </label>

          <div className="flex flex-wrap justify-end gap-3 md:col-span-2">
            <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-100" type="button" onClick={() => setFormData(initialForm)}>
              Reset form
            </button>
            <button className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 font-semibold text-white" type="submit">
              {submitState.status === "loading" ? "Saving..." : "Create requirement"}
            </button>
          </div>

          {submitState.message ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold md:col-span-2 ${
                submitState.status === "success"
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                  : submitState.status === "error"
                    ? "border-red-400/20 bg-red-400/10 text-red-200"
                    : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
              }`}
            >
              {submitState.message}
            </div>
          ) : null}
        </form>
      </section>

      <aside className="rounded-[28px] border border-fuchsia-400/20 bg-fuchsia-400/10 p-6 shadow-glow backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-200">Smart Assist</p>
        <h3 className="mt-2 text-3xl font-semibold text-white">Conflict and similarity alerts</h3>
        <div className="mt-6 flex gap-3 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
          <div className="pt-1 text-fuchsia-200">
            <Sparkles />
          </div>
          <p className="text-sm leading-7 text-slate-200">
            REQ-019 contains overlapping session management rules that may conflict with this requirement.
          </p>
        </div>

        <div className="mt-4 grid gap-3">
          {collaborationThreads.map((thread) => (
            <article key={thread.title} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <small className="text-xs uppercase tracking-[0.18em] text-slate-400">{thread.tag}</small>
              <h4 className="mt-2 text-lg font-semibold text-white">{thread.title}</h4>
              <p className="mt-2 text-sm leading-7 text-slate-300">{thread.excerpt}</p>
              <span className="mt-2 inline-block text-xs text-slate-400">{thread.participants} participants</span>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default WorkbenchPage;
