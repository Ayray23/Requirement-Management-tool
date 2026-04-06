import { NavLink, useParams } from "react-router-dom";
import { requirementActivity, requirements } from "../data/mockData";
import Button from "../components/ui/Button";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";

function RequirementDetailPage() {
  const { requirementId } = useParams();
  const requirement = requirements.find((item) => item.id === requirementId);

  if (!requirement) {
    return (
      <Card>
        <CardHeader
          eyebrow="Requirement Detail"
          title="Requirement not found"
          description="The requirement you opened does not exist in the current dataset."
          actions={<Button as={NavLink} to="/requirements" variant="secondary">Back to requirements</Button>}
        />
      </Card>
    );
  }

  const activity = requirementActivity.filter((item) => item.requirementId === requirement.id);

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
    </div>
  );
}

export default RequirementDetailPage;
