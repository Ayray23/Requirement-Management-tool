import { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import { createRequirementCommentRecord, getRequirementById, updateRequirementRecord } from "../app/firestoreService";
import { deleteRequirementCascadeAction } from "../app/services/adminService";
import { canManageRequirements } from "../app/roles";
import Button from "../components/ui/Button";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";
import { Field, SelectInput, TextArea, TextInput } from "../components/ui/Field";

function buildFormState(source) {
  return {
    title: source?.title ?? "",
    module: source?.module ?? "",
    priority: source?.priority ?? "Medium",
    status: source?.status ?? "Draft",
    ownerName: source?.ownerName ?? source?.owner ?? "",
    sprint: source?.sprint ?? "",
    progress: String(source?.progress ?? 0),
    description: source?.description ?? "",
    acceptanceCriteria: (source?.acceptanceCriteria ?? []).join("\n"),
    dependencyIds: (source?.dependencyIds ?? source?.dependencies ?? []).join("\n")
  };
}

function RequirementDetailPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { requirementId } = useParams();
  const [requirement, setRequirement] = useState(null);
  const [activity, setActivity] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentState, setCommentState] = useState({
    status: "idle",
    message: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(buildFormState(null));
  const [editState, setEditState] = useState({
    status: "idle",
    message: ""
  });
  const [deleteState, setDeleteState] = useState({
    status: "idle",
    message: ""
  });
  const [detailState, setDetailState] = useState({
    loading: true,
    error: ""
  });

  useEffect(() => {
    let active = true;

    if (!requirementId) {
      setDetailState({
        loading: false,
        error: "No requirement id was provided."
      });
      return undefined;
    }

    getRequirementById(requirementId)
      .then((data) => {
        if (active && data) {
          setRequirement(data);
          setActivity(data.activity ?? []);
          setComments(data.comments ?? []);
          setEditForm(buildFormState(data));
          setDetailState({
            loading: false,
            error: ""
          });
        }
      })
      .catch(() => {
        if (active) {
          setDetailState({
            loading: false,
            error: "Requirement not found."
          });
        }
      });

    return () => {
      active = false;
    };
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

    setEditState({
      status: "loading",
      message: "Saving requirement changes..."
    });

    try {
      const updatedRequirement = await updateRequirementRecord(requirementId, {
        ...editForm,
        ownerUid: requirement?.ownerUid || "",
        updatedByUid: session.user?.uid || "",
        updatedByName: session.user?.name || "Workspace User",
        progress: Number(editForm.progress),
        acceptanceCriteria: editForm.acceptanceCriteria
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        dependencyIds: editForm.dependencyIds
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      });

      setRequirement(updatedRequirement);
      setActivity(updatedRequirement.activity ?? activity);
      setComments(updatedRequirement.comments ?? comments);
      setEditForm(buildFormState(updatedRequirement));
      setIsEditing(false);
      setEditState({
        status: "success",
        message: "Requirement updated successfully."
      });
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

    const confirmed = window.confirm("Delete this requirement? This action cannot be undone.");

    if (!confirmed) {
      return;
    }

    setDeleteState({
      status: "loading",
      message: "Deleting requirement..."
    });

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
      setCommentState({
        status: "error",
        message: "Write a comment before posting."
      });
      return;
    }

    setCommentState({
      status: "loading",
      message: "Posting comment..."
    });

    try {
      const comment = await createRequirementCommentRecord(requirementId, {
        authorName: session.user?.name || "Workspace User",
        authorUid: session.user?.uid || "",
        authorRole: session.user?.role || "user",
        message: commentMessage.trim()
      });

      setComments((current) => [comment, ...current]);
      setActivity((current) => [
        {
          id: `local-${Date.now()}`,
          requirementId,
          text: `${session.user?.name || "Workspace User"} added a new discussion comment.`,
          time: "Just now"
        },
        ...current
      ]);
      setCommentMessage("");
      setCommentState({
        status: "success",
        message: "Comment posted."
      });
    } catch (error) {
      setCommentState({
        status: "error",
        message: error.message || "Could not post the comment right now."
      });
    }
  }

  if (!requirement) {
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
          eyebrow={`Requirement ${requirement.id}`}
          title={requirement.title}
          description={requirement.description}
          actions={
            <>
              <Button as={NavLink} to="/requirements" variant="secondary">
                Back to requirements
              </Button>
              {canManageRequirements(session.user?.role) ? (
                <Button variant="ghost" onClick={() => setIsEditing((current) => !current)} type="button">
                  {isEditing ? "Close editor" : "Edit requirement"}
                </Button>
              ) : null}
              <Button as={NavLink} to="/workbench">
                Refine in workbench
              </Button>
            </>
          }
        />
      </Card>

      {detailState.loading ? (
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 font-semibold text-cyan-100">
          Loading requirement detail...
        </div>
      ) : detailState.error ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 font-semibold text-amber-200">
          {detailState.error}
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 font-semibold text-emerald-200">
          Requirement detail loaded successfully.
        </div>
      )}

      {isEditing ? (
        <Card>
          <CardHeader eyebrow="Edit Requirement" title="Update requirement details" description="Keep this requirement current as scope, ownership, and delivery status change." />
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleRequirementSave}>
            <Field label="Title" className="md:col-span-2">
              <TextInput value={editForm.title} onChange={(event) => handleEditFieldChange("title", event.target.value)} />
            </Field>
            <Field label="Module">
              <TextInput value={editForm.module} onChange={(event) => handleEditFieldChange("module", event.target.value)} />
            </Field>
            <Field label="Owner">
              <TextInput value={editForm.ownerName} onChange={(event) => handleEditFieldChange("ownerName", event.target.value)} />
            </Field>
            <Field label="Priority">
              <SelectInput value={editForm.priority} onChange={(event) => handleEditFieldChange("priority", event.target.value)}>
                {["Low", "Medium", "High", "Critical"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Status">
              <SelectInput value={editForm.status} onChange={(event) => handleEditFieldChange("status", event.target.value)}>
                {["Draft", "Backlog", "In Progress", "In Review", "Blocked", "Completed"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="Sprint">
              <TextInput value={editForm.sprint} onChange={(event) => handleEditFieldChange("sprint", event.target.value)} />
            </Field>
            <Field label="Progress (%)">
              <TextInput
                type="number"
                min="0"
                max="100"
                value={editForm.progress}
                onChange={(event) => handleEditFieldChange("progress", event.target.value)}
              />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <TextArea value={editForm.description} onChange={(event) => handleEditFieldChange("description", event.target.value)} className="min-h-[140px]" />
            </Field>
            <Field label="Acceptance Criteria (one per line)">
              <TextArea
                value={editForm.acceptanceCriteria}
                onChange={(event) => handleEditFieldChange("acceptanceCriteria", event.target.value)}
                className="min-h-[180px]"
              />
            </Field>
            <Field label="Dependencies (one per line)">
              <TextArea
                value={editForm.dependencyIds}
                onChange={(event) => handleEditFieldChange("dependencyIds", event.target.value)}
                className="min-h-[180px]"
              />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
              <Button className="bg-red-500 text-white hover:bg-red-400" type="button" onClick={handleDeleteRequirement}>
                {deleteState.status === "loading" ? "Deleting..." : "Delete requirement"}
              </Button>
              <div className="flex flex-wrap justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editState.status === "loading" ? "Saving..." : "Save changes"}</Button>
              </div>
            </div>
            {editState.message ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold md:col-span-2 ${
                  editState.status === "success"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : editState.status === "loading"
                      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                      : "border-red-400/20 bg-red-400/10 text-red-200"
                }`}
              >
                {editState.message}
              </div>
            ) : null}
            {deleteState.message ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200 md:col-span-2">
                {deleteState.message}
              </div>
            ) : null}
          </form>
        </Card>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader eyebrow="Overview" title="Requirement breakdown" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Module", requirement.module],
              ["Owner", requirement.ownerName],
              ["Priority", requirement.priority],
              ["Status", requirement.status],
              ["Sprint", requirement.sprint],
              ["Progress", `${requirement.progress}%`]
            ].map(([label, value]) => (
              <InfoCard key={label}>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-2 text-lg font-semibold text-white">{value}</p>
              </InfoCard>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Dependencies" title="What this requirement depends on" />
          <div className="mt-6 grid gap-3">
            {(requirement.dependencyIds ?? []).map((item) => (
              <InfoCard key={item} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
                <p className="text-sm text-slate-200">{item}</p>
              </InfoCard>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader eyebrow="Acceptance Criteria" title="Definition of done" />
          <div className="mt-6 grid gap-3">
            {requirement.acceptanceCriteria.map((item) => (
              <InfoCard key={item} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <p className="text-sm leading-7 text-slate-200">{item}</p>
              </InfoCard>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader eyebrow="Recent Activity" title="Requirement timeline" />
          <div className="mt-6 grid gap-3">
            {activity.length > 0 ? (
              activity.map((item) => (
                <InfoCard key={item.id}>
                  <p className="text-sm leading-7 text-slate-200">{item.text}</p>
                  <p className="mt-2 text-xs text-slate-400">{item.time}</p>
                </InfoCard>
              ))
            ) : (
              <InfoCard>
                <p className="text-sm text-slate-300">No recent activity has been recorded for this requirement yet.</p>
              </InfoCard>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader eyebrow="Discussion" title="Add a comment" description="Capture team feedback, blockers, and decisions for this requirement." />
          <form className="mt-6 grid gap-4" onSubmit={handleCommentSubmit}>
            <Field label="Comment">
              <TextArea
                className="min-h-[160px]"
                value={commentMessage}
                onChange={(event) => setCommentMessage(event.target.value)}
                placeholder="Share an update, ask a question, or flag a blocker..."
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit">{commentState.status === "loading" ? "Posting..." : "Post comment"}</Button>
            </div>
            {commentState.message ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  commentState.status === "success"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : commentState.status === "loading"
                      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                      : "border-red-400/20 bg-red-400/10 text-red-200"
                }`}
              >
                {commentState.message}
              </div>
            ) : null}
          </form>
        </Card>

        <Card>
          <CardHeader eyebrow="Thread" title="Requirement discussion" description={`${comments.length} comment${comments.length === 1 ? "" : "s"} in this conversation`} />
          <div className="mt-6 grid gap-3">
            {comments.length > 0 ? (
              comments.map((comment) => (
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
    </div>
  );
}

export default RequirementDetailPage;
