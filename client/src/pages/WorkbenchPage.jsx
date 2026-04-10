import { useEffect, useState } from "react";
import { useAuth } from "../app/AuthContext";
import { Sparkles } from "../app/icons";
import { createRequirementRecord, getCollaborationMetrics } from "../app/firestoreService";
import Button from "../components/ui/Button";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";
import { Field, TextArea, TextInput } from "../components/ui/Field";

function WorkbenchPage() {
  const { session } = useAuth();
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
  const [threadData, setThreadData] = useState([]);

  useEffect(() => {
    getCollaborationMetrics()
      .then((data) => setThreadData(data.threads.slice(0, 3)))
      .catch(() => setThreadData([]));
  }, []);

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
      const createdRequirement = await createRequirementRecord({
        ...formData,
        owner: session.user?.name || "Workspace User"
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
      <Card>
        <CardHeader eyebrow="AI Workbench" title="Create or refine a requirement" />
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Requirement title">
            <TextInput name="title" value={formData.title} onChange={handleChange} />
          </Field>
          <Field label="Priority">
            <TextInput name="priority" value={formData.priority} onChange={handleChange} />
          </Field>
          <Field label="Module">
            <TextInput name="module" value={formData.module} onChange={handleChange} />
          </Field>
          <Field label="Sprint">
            <TextInput name="sprint" value={formData.sprint} onChange={handleChange} />
          </Field>
          <Field className="md:col-span-2" label="Description">
            <TextArea className="min-h-[220px]" name="description" value={formData.description} onChange={handleChange} />
          </Field>

          <div className="flex flex-wrap justify-end gap-3 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setFormData(initialForm)}>
              Reset form
            </Button>
            <Button type="submit">{submitState.status === "loading" ? "Saving..." : "Create requirement"}</Button>
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
      </Card>

      <Card className="border-fuchsia-400/20 bg-fuchsia-400/10">
        <CardHeader eyebrow="Smart Assist" title="Conflict and similarity alerts" />
        <InfoCard className="mt-6 flex gap-3">
          <div className="pt-1 text-fuchsia-200">
            <Sparkles />
          </div>
          <p className="text-sm leading-7 text-slate-200">
            REQ-019 contains overlapping session management rules that may conflict with this requirement.
          </p>
        </InfoCard>

        <div className="mt-4 grid gap-3">
          {threadData.map((thread) => (
            <InfoCard key={thread.title}>
              <small className="text-xs uppercase tracking-[0.18em] text-slate-400">{thread.tag}</small>
              <h4 className="mt-2 text-lg font-semibold text-white">{thread.title}</h4>
              <p className="mt-2 text-sm leading-7 text-slate-300">{thread.excerpt}</p>
              <span className="mt-2 inline-block text-xs text-slate-400">{thread.participants} participants</span>
            </InfoCard>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default WorkbenchPage;
