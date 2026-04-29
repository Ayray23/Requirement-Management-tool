import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import {
  createRequirementCommentRecord,
  getRequirementById,
  reviewRequirementRecord,
  updateRequirementRecord
} from "../app/firestoreService";
import { deleteRequirementCascadeAction } from "../app/services/adminService";
import { canManageRequirements } from "../app/roles";
import Button from "../components/ui/Button";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";
import { Field, SelectInput, TextArea, TextInput } from "../components/ui/Field";

function buildFormState(source) {
  return {
    title: source?.title ?? "",
    project: source?.project ?? "",
    module: source?.module ?? "",
    type: source?.type ?? "Functional",
    priority: source?.priority ?? "Medium",
    status: source?.status ?? "Pending",
    stakeholder: source?.stakeholder ?? "",
    ownerName: source?.ownerName ?? source?.owner ?? "",
    sprint: source?.sprint ?? "",
    progress: String(source?.progress ?? 0),
    description: source?.description ?? "",
    acceptanceCriteria: (source?.acceptanceCriteria ?? []).join("\n"),
    dependencyIds: (source?.dependencyIds ?? []).join("\n"),
    tags: (source?.tags ?? []).join(", ")
  };
}

function RequirementDetailPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { requirementId } = useParams();
  const [requirement, setRequirement] = useState(null);
  const [commentMessage, setCommentMessage] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [commentState, setCommentState] = useState({ status: "idle", message: "" });
  const [reviewState, setReviewState] = useState({ status: "idle", message: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(buildFormState(null));
  const [editState, setEditState] = useState({ status: "idle", message: "" });
  const [deleteState, setDeleteState] = useState({ status: "idle", message: "" });
  const [detailState, setDetailState] = useState({ loading: true, error: "" });

  async function loadRequirement() {
    if (!requirementId) {
      setDetailState({ loading: false, error: "No requirement id was provided." });
      return;
    }

    try {
      const data = await getRequirementById(requirementId);
      if (!data) {
        setDetailState({ loading: false, error: "Requirement not found." });
        return;
      }

      setRequirement(data);
      setEditForm(buildFormState(data));
      setDetailState({ loading: false, error: "" });
    } catch {
      setDetailState({ loading: false, error: "Requirement not found." });
    }
  }

  useEffect(() => {
    setDetailState({ loading: true, error: "" });
    loadRequirement();
  }, [requirementId]);

  function handleEditFieldChange(field, value) {
    setEditForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleRequirementSave(event) {
    event.preventDefault();
    if (!requirementId) {
      return;
    }

    setEditState({ status: "loading", message: "Saving requirement changes..." });

    try {
      const updatedRequirement = await updateRequirementRecord(requirementId, {
        ...editForm,
        ownerUid: requirement?.ownerUid || "",
        stakeholderUid: requirement?.stakeholderUid || "",
        updatedByUid: session.user?.uid || "",
        updatedByName: session.user?.name || "Workspace User",
        progress: Number(editForm.progress),
        acceptanceCriteria: editForm.acceptanceCriteria.split("\n").map((item) => item.trim()).filter(Boolean),
        dependencyIds: editForm.dependencyIds.split("\n").map((item) => item.trim()).filter(Boolean),
        tags: editForm.tags.split(",").map((item) => item.trim()).filter(Boolean)
      });

      setRequirement(updatedRequirement);
      setEditForm(buildFormState(updatedRequirement));
      setIsEditing(false);
      setEditState({ status: "success", message: "Requirement updated successfully." });
    } catch (error) {
      setEditState({
        status: "error",
        message: error.message || "Could not save this requirement right now."
      });
    }
  }

  async function handleDeleteRequirement() {
    if (!requirementId) {
      return;
    }

    if (!window.confirm("Delete this requirement? This action cannot be undone.")) {
      return;
    }

    setDeleteState({ status: "loading", message: "Deleting requirement..." });

    try {
      await deleteRequirementCascadeAction(requirementId);
      navigate("/requirements");
    } catch (error) {
      setDeleteState({
        status: "error",
        message: error.message || "Could not delete this requirement right now."
      });
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();

    if (!requirementId || !commentMessage.trim()) {
      setCommentState({ status: "error", message: "Write a comment before posting." });
      return;
    }

    setCommentState({ status: "loading", message: "Posting comment..." });

    try {
      await createRequirementCommentRecord(requirementId, {
        authorName: session.user?.name || "Workspace User",
        authorUid: session.user?.uid || "",
        authorRole: session.user?.role || "user",
        message: commentMessage.trim()
      });

      setCommentMessage("");
      setCommentState({ status: "success", message: "Comment posted." });
      await loadRequirement();
    } catch (error) {
      setCommentState({
        status: "error",
        message: error.message || "Could not post the comment right now."
      });
    }
  }

  async function handleReview(decision) {
    if (!requirementId) {
      return;
    }

    setReviewState({ status: "loading", message: `${decision} requirement...` });

    try {
      await reviewRequirementRecord(requirementId, {
        decision,
        comment: reviewComment,
        actorName: session.user?.name || "Workspace User"
      });
      setReviewComment("");
      setReviewState({ status: "success", message: `Requirement ${decision.toLowerCase()} successfully.` });
      await loadRequirement();
    } catch (error) {
      setReviewState({
        status: "error",
        message: error.message || "Could not record this review decision right now."
      });
    }
  }

  if (!requirement && !detailState.loading) {
    return (
      <Card>
        <CardHeader
          eyebrow="Requirement Detail"
          title="Requirement not found"
          description="The requirement you opened does not exist in the current dataset."
          actions={
            <Button as={NavLink} to="/requirements" variant="secondary">
              Back to requirements
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader
          eyebrow={`Requirement ${requirement?.id || requirementId}`}
          title={requirement?.title || "Requirement detail"}
          description={requirement?.description || "Loading requirement detail"}
          actions={
            <>
              <Button as={NavLink} to="/requirements" variant="secondary">Back to requirements</Button>
              {canManageRequirements(session.user?.role) ? (
                <Button variant="ghost" onClick={() => setIsEditing((current) => !current)} type="button">
                  {isEditing ? "Close editor" : "Edit requirement"}
                </Button>
              ) : null}
            </>
          }
        />
      </Card>

      {detailState.loading ? (
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 font-semibold text-cyan-100">Loading requirement detail...</div>
      ) : detailState.error ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 font-semibold text-amber-200">{detailState.error}</div>
      ) : null}

      {isEditing ? (
        <Card>
          <CardHeader eyebrow="Edit Requirement" title="Update requirement details" description="Manage project alignment, requirement quality, and workflow state in one form." />
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleRequirementSave}>
            <Field label="Title" className="md:col-span-2">
              <TextInput value={editForm.title} onChange={(event) => handleEditFieldChange("title", event.target.value)} />
            </Field>
            <Field label="Project">
              <TextInput value={editForm.project} onChange={(event) => handleEditFieldChange("project", event.target.value)} />
            </Field>
            <Field label="Module">
              <TextInput value={editForm.module} onChange={(event) => handleEditFieldChange("module", event.target.value)} />
            </Field>
            <Field label="Type">
              <SelectInput value={editForm.type} onChange={(event) => handleEditFieldChange("type", event.target.value)}>
                {["Functional", "Non-functional"].map((item) => <option key={item} value={item}>{item}</option>)}
              </SelectInput>
            </Field>
            <Field label="Priority">
              <SelectInput value={editForm.priority} onChange={(event) => handleEditFieldChange("priority", event.target.value)}>
                {["Low", "Medium", "High"].map((item) => <option key={item} value={item}>{item}</option>)}
              </SelectInput>
            </Field>
            <Field label="Status">
              <SelectInput value={editForm.status} onChange={(event) => handleEditFieldChange("status", event.target.value)}>
                {["Pending", "Approved", "Rejected", "In Progress"].map((item) => <option key={item} value={item}>{item}</option>)}
              </SelectInput>
            </Field>
            <Field label="Stakeholder">
              <TextInput value={editForm.stakeholder} onChange={(event) => handleEditFieldChange("stakeholder", event.target.value)} />
            </Field>
            <Field label="Owner">
              <TextInput value={editForm.ownerName} onChange={(event) => handleEditFieldChange("ownerName", event.target.value)} />
            </Field>
            <Field label="Sprint">
              <TextInput value={editForm.sprint} onChange={(event) => handleEditFieldChange("sprint", event.target.value)} />
            </Field>
            <Field label="Progress (%)">
              <TextInput type="number" min="0" max="100" value={editForm.progress} onChange={(event) => handleEditFieldChange("progress", event.target.value)} />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <TextArea value={editForm.description} onChange={(event) => handleEditFieldChange("description", event.target.value)} className="min-h-[140px]" />
            </Field>
            <Field label="Acceptance Criteria">
              <TextArea value={editForm.acceptanceCriteria} onChange={(event) => handleEditFieldChange("acceptanceCriteria", event.target.value)} className="min-h-[180px]" />
            </Field>
            <Field label="Dependencies">
              <TextArea value={editForm.dependencyIds} onChange={(event) => handleEditFieldChange("dependencyIds", event.target.value)} className="min-h-[180px]" />
            </Field>
            <Field className="md:col-span-2" label="Tags">
              <TextInput value={editForm.tags} onChange={(event) => handleEditFieldChange("tags", event.target.value)} />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
              <Button className="bg-red-500 text-white hover:bg-red-400" type="button" onClick={handleDeleteRequirement}>
                {deleteState.status === "loading" ? "Deleting..." : "Delete requirement"}
              </Button>
              <div className="flex flex-wrap justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit">{editState.status === "loading" ? "Saving..." : "Save changes"}</Button>
              </div>
            </div>
          </form>
        </Card>
      ) : null}

      {requirement ? (
        <>
          <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
            <Card>
              <CardHeader eyebrow="Overview" title="Requirement breakdown" />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  ["Project", requirement.project],
                  ["Module", requirement.module],
                  ["Type", requirement.type],
                  ["Priority", requirement.priority],
                  ["Status", requirement.status],
                  ["Stakeholder", requirement.stakeholder],
                  ["Owner", requirement.ownerName],
                  ["Progress", `${requirement.progress}%`]
                ].map(([label, value]) => (
                  <InfoCard key={label}>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
                  </InfoCard>
                ))}
              </div>
            </Card>

            <Card className="border-fuchsia-400/20 bg-fuchsia-400/10">
              <CardHeader eyebrow="Smart Analysis" title="Quality and risk signals" />
              <div className="mt-6 grid gap-3">
                <InfoCard>
                  <p className="text-sm font-semibold text-white">{requirement.analysis.summary}</p>
                  <p className="mt-2 text-sm text-slate-300">Suggested type: {requirement.analysis.typeSuggestion} | Suggested priority: {requirement.analysis.prioritySuggestion}</p>
                </InfoCard>
                <InfoCard>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Suggested rewrite</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{requirement.analysis.rewrittenRequirement}</p>
                </InfoCard>
                <InfoCard>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Clarity suggestions</p>
                  {(requirement.analysis.clarity.suggestions || []).length > 0 ? (
                    <div className="mt-3 grid gap-2">
                      {requirement.analysis.clarity.suggestions.map((item) => <p key={item} className="text-sm text-slate-200">{item}</p>)}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-emerald-200">No major ambiguity detected.</p>
                  )}
                </InfoCard>
              </div>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader eyebrow="Approval Workflow" title="Review and sign-off" description="Stakeholders and analysts can record a workflow decision with a note." />
              <div className="mt-6 grid gap-3">
                {(requirement.approvals || []).length > 0 ? (
                  requirement.approvals.map((item) => (
                    <InfoCard key={item.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">{item.actorName}</p>
                        <span className="text-xs text-slate-400">{item.decision}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{item.comment || "No review note provided."}</p>
                      <p className="mt-2 text-xs text-slate-400">{item.time}</p>
                    </InfoCard>
                  ))
                ) : (
                  <InfoCard>
                    <p className="text-sm text-slate-300">No approval decisions have been recorded yet.</p>
                  </InfoCard>
                )}
              </div>
              <form className="mt-6 grid gap-4" onSubmit={(event) => event.preventDefault()}>
                <Field label="Review note">
                  <TextArea className="min-h-[120px]" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Explain why this should be approved or rejected..." />
                </Field>
                <div className="flex flex-wrap justify-end gap-3">
                  <Button type="button" variant="secondary" onClick={() => handleReview("Rejected")}>Reject</Button>
                  <Button type="button" onClick={() => handleReview("Approved")}>Approve</Button>
                </div>
                {reviewState.message ? (
                  <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    reviewState.status === "success"
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                      : reviewState.status === "loading"
                        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                        : "border-red-400/20 bg-red-400/10 text-red-200"
                  }`}>
                    {reviewState.message}
                  </div>
                ) : null}
              </form>
            </Card>

            <Card>
              <CardHeader eyebrow="Version History" title="Tracked changes" description={`${requirement.versionCount} version${requirement.versionCount === 1 ? "" : "s"} recorded for this requirement`} />
              <div className="mt-6 grid gap-3">
                {(requirement.versions || []).length > 0 ? (
                  requirement.versions.map((item) => (
                    <InfoCard key={item.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-white">{item.title}</p>
                        <span className="text-xs text-slate-400">{item.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{item.changeNote}</p>
                      <p className="mt-2 text-xs text-slate-400">Edited by {item.editorName} | {item.time}</p>
                    </InfoCard>
                  ))
                ) : (
                  <InfoCard>
                    <p className="text-sm text-slate-300">No additional versions have been stored yet.</p>
                  </InfoCard>
                )}
              </div>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader eyebrow="Requirement Content" title="Acceptance criteria and dependencies" />
              <div className="mt-6 grid gap-4">
                <InfoCard>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Acceptance criteria</p>
                  <div className="mt-3 grid gap-2">
                    {(requirement.acceptanceCriteria || []).map((item) => <p key={item} className="text-sm text-slate-200">{item}</p>)}
                  </div>
                </InfoCard>
                <InfoCard>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Dependencies</p>
                  <div className="mt-3 grid gap-2">
                    {(requirement.dependencyIds || []).length > 0 ? (
                      requirement.dependencyIds.map((item) => <p key={item} className="text-sm text-slate-200">{item}</p>)
                    ) : (
                      <p className="text-sm text-slate-300">No dependencies recorded.</p>
                    )}
                  </div>
                </InfoCard>
              </div>
            </Card>

            <Card>
              <CardHeader eyebrow="Discussion" title="Comments and collaboration" description={`${requirement.comments.length} comment${requirement.comments.length === 1 ? "" : "s"} in this thread`} />
              <form className="mt-6 grid gap-4" onSubmit={handleCommentSubmit}>
                <Field label="Comment">
                  <TextArea className="min-h-[120px]" value={commentMessage} onChange={(event) => setCommentMessage(event.target.value)} placeholder="Share an update, ask a question, or flag a blocker..." />
                </Field>
                <div className="flex justify-end">
                  <Button type="submit">{commentState.status === "loading" ? "Posting..." : "Post comment"}</Button>
                </div>
              </form>
              {commentState.message ? (
                <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  commentState.status === "success"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : commentState.status === "loading"
                      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                      : "border-red-400/20 bg-red-400/10 text-red-200"
                }`}>
                  {commentState.message}
                </div>
              ) : null}
              <div className="mt-6 grid gap-3">
                {requirement.comments.length > 0 ? (
                  requirement.comments.map((comment) => (
                    <InfoCard key={comment.id}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{comment.authorName}</p>
                          <p className="text-xs text-slate-400">{comment.authorRole}</p>
                        </div>
                        <span className="text-xs text-slate-400">{comment.time}</span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-200">{comment.message}</p>
                    </InfoCard>
                  ))
                ) : (
                  <InfoCard>
                    <p className="text-sm text-slate-300">No comments yet. Start the discussion for this requirement.</p>
                  </InfoCard>
                )}
              </div>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}

export default RequirementDetailPage;
