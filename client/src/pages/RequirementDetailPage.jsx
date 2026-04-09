import { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { createRequirementComment, getRequirementById } from "../app/api";
import { requirementActivity, requirements, userProfile } from "../data/mockData";
import Button from "../components/ui/Button";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";
import { Field, TextArea } from "../components/ui/Field";

function RequirementDetailPage() {
  const { requirementId } = useParams();
  const fallbackRequirement = requirements.find((item) => item.id === requirementId);
  const [requirement, setRequirement] = useState(fallbackRequirement ?? null);
  const [activity, setActivity] = useState(
    fallbackRequirement ? requirementActivity.filter((item) => item.requirementId === fallbackRequirement.id) : []
  );
  const [comments, setComments] = useState(fallbackRequirement?.comments ?? []);
  const [commentMessage, setCommentMessage] = useState("");
  const [commentState, setCommentState] = useState({
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
        if (active) {
          setRequirement(data);
          setActivity(data.activity ?? []);
          setComments(data.comments ?? []);
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
            error: fallbackRequirement ? "Live detail data is unavailable, so demo data is being shown." : "Requirement not found."
          });
        }
      });

    return () => {
      active = false;
    };
  }, [fallbackRequirement, requirementId]);

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
      const comment = await createRequirementComment(requirementId, {
        author: userProfile.name,
        role: userProfile.role,
        message: commentMessage.trim()
      });

      setComments((current) => [comment, ...current]);
      setActivity((current) => [
        {
          id: `local-${Date.now()}`,
          requirementId,
          text: `${userProfile.name} added a new discussion comment.`,
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

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader eyebrow="Overview" title="Requirement breakdown" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["Module", requirement.module],
              ["Owner", requirement.owner],
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
            {requirement.dependencies.map((item) => (
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
                      <p className="font-semibold text-white">{comment.author}</p>
                      <p className="text-xs text-slate-400">{comment.role}</p>
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
