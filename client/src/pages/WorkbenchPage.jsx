import { useEffect, useState } from "react";
import { useAuth } from "../app/AuthContext";
import { Sparkles } from "../app/icons";
import { createRequirementRecord, previewRequirementAnalysis } from "../app/firestoreService";
import Button from "../components/ui/Button";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";
import { Field, SelectInput, TextArea, TextInput } from "../components/ui/Field";

const initialForm = {
  title: "Stakeholders should approve submitted requirements within 48 hours",
  description:
    "The system should route every new requirement to assigned stakeholders, capture approval or rejection comments, and remind reviewers before the deadline.",
  type: "",
  priority: "",
  stakeholder: "",
  project: "REMT Platform",
  module: "Workflow Management",
  sprint: "Sprint 7",
  acceptanceCriteria: "Approvers can approve or reject a requirement.\nApproval decisions are timestamped.\nPending reviews are highlighted on the dashboard.",
  dependencyIds: "",
  tags: "workflow, approval, collaboration"
};

function WorkbenchPage() {
  const { session } = useAuth();
  const [formData, setFormData] = useState(initialForm);
  const [analysis, setAnalysis] = useState(null);
  const [analysisState, setAnalysisState] = useState({ loading: true, error: "" });
  const [submitState, setSubmitState] = useState({ status: "idle", message: "" });

  useEffect(() => {
    let active = true;
    setAnalysisState({ loading: true, error: "" });

    const timeoutId = window.setTimeout(() => {
      previewRequirementAnalysis(formData)
        .then((result) => {
          if (active) {
            setAnalysis(result);
            setAnalysisState({ loading: false, error: "" });
          }
        })
        .catch(() => {
          if (active) {
            setAnalysis(null);
            setAnalysisState({ loading: false, error: "AI analysis preview is unavailable right now." });
          }
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [formData]);

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
        type: formData.type || analysis?.typeSuggestion || "Functional",
        priority: formData.priority || analysis?.prioritySuggestion || "Medium",
        stakeholder: formData.stakeholder || session.user?.name || "Workspace User",
        stakeholderUid: session.user?.uid || "",
        ownerName: session.user?.name || "Workspace User",
        ownerUid: session.user?.uid || "",
        createdByName: session.user?.name || "Workspace User",
        createdByUid: session.user?.uid || "",
        acceptanceCriteria: formData.acceptanceCriteria.split("\n").map((item) => item.trim()).filter(Boolean),
        dependencyIds: formData.dependencyIds.split("\n").map((item) => item.trim()).filter(Boolean),
        tags: formData.tags.split(",").map((item) => item.trim()).filter(Boolean)
      });

      setSubmitState({
        status: "success",
        message: `${createdRequirement.id} created successfully with smart analysis attached.`
      });
      setFormData(initialForm);
    } catch (error) {
      setSubmitState({
        status: "error",
        message: error.message || "Could not create the requirement right now."
      });
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader eyebrow="AI Workbench" title="Create and refine a requirement" description="Capture a requirement once, then let REMT classify, score, and clean it up before it enters approval workflow." />
        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Title" className="md:col-span-2">
            <TextInput name="title" value={formData.title} onChange={handleChange} />
          </Field>
          <Field label="Project">
            <TextInput name="project" value={formData.project} onChange={handleChange} />
          </Field>
          <Field label="Module">
            <TextInput name="module" value={formData.module} onChange={handleChange} />
          </Field>
          <Field label="Type">
            <SelectInput name="type" value={formData.type} onChange={handleChange}>
              <option value="">Use smart suggestion</option>
              <option value="Functional">Functional</option>
              <option value="Non-functional">Non-functional</option>
            </SelectInput>
          </Field>
          <Field label="Priority">
            <SelectInput name="priority" value={formData.priority} onChange={handleChange}>
              <option value="">Use smart suggestion</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </SelectInput>
          </Field>
          <Field label="Stakeholder">
            <TextInput name="stakeholder" value={formData.stakeholder} onChange={handleChange} placeholder="Product Owner" />
          </Field>
          <Field label="Sprint">
            <TextInput name="sprint" value={formData.sprint} onChange={handleChange} />
          </Field>
          <Field className="md:col-span-2" label="Description">
            <TextArea className="min-h-[180px]" name="description" value={formData.description} onChange={handleChange} />
          </Field>
          <Field label="Acceptance Criteria">
            <TextArea className="min-h-[160px]" name="acceptanceCriteria" value={formData.acceptanceCriteria} onChange={handleChange} />
          </Field>
          <Field label="Related Requirements / Dependencies">
            <TextArea className="min-h-[160px]" name="dependencyIds" value={formData.dependencyIds} onChange={handleChange} />
          </Field>
          <Field className="md:col-span-2" label="Tags">
            <TextInput name="tags" value={formData.tags} onChange={handleChange} placeholder="security, onboarding, reporting" />
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
        <CardHeader eyebrow="Smart Assist" title="Live quality analysis" />
        {analysisState.loading ? (
          <InfoCard className="mt-6">
            <p className="text-sm text-slate-200">Analyzing requirement quality...</p>
          </InfoCard>
        ) : analysisState.error ? (
          <InfoCard className="mt-6">
            <p className="text-sm text-red-200">{analysisState.error}</p>
          </InfoCard>
        ) : (
          <div className="mt-6 grid gap-3">
            <InfoCard className="flex gap-3">
              <div className="pt-1 text-fuchsia-200">
                <Sparkles />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{analysis?.summary}</p>
                <p className="mt-2 text-sm text-slate-300">Suggested type: {analysis?.typeSuggestion} | Suggested priority: {analysis?.prioritySuggestion}</p>
              </div>
            </InfoCard>

            <InfoCard>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Rewrite suggestion</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">{analysis?.rewrittenRequirement}</p>
            </InfoCard>

            <InfoCard>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Clarity warnings</p>
              {analysis?.clarity?.suggestions?.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {analysis.clarity.suggestions.map((item) => (
                    <p key={item} className="text-sm text-slate-200">{item}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-emerald-200">No major ambiguity detected.</p>
              )}
            </InfoCard>

            <InfoCard>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Potential duplicates</p>
              {analysis?.duplicateCandidates?.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {analysis.duplicateCandidates.map((item) => (
                    <p key={item.id} className="text-sm text-slate-200">{item.id} - {item.title} ({item.similarity}% similar)</p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-300">No strong duplicate candidates found.</p>
              )}
            </InfoCard>

            <InfoCard>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Potential conflicts</p>
              {analysis?.conflictCandidates?.length > 0 ? (
                <div className="mt-3 grid gap-2">
                  {analysis.conflictCandidates.map((item) => (
                    <p key={item.id} className="text-sm text-slate-200">{item.id} - {item.reason}</p>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-300">No explicit conflicts detected in current records.</p>
              )}
            </InfoCard>
          </div>
        )}
      </Card>
    </div>
  );
}

export default WorkbenchPage;
