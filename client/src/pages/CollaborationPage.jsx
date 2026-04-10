import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getCollaborationMetrics } from "../app/firestoreService";
import Button from "../components/ui/Button";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";

function CollaborationPage() {
  const [collaborationData, setCollaborationData] = useState({
    threads: [],
    members: [],
    activity: []
  });

  useEffect(() => {
    let active = true;

    getCollaborationMetrics()
      .then((data) => {
        if (active) {
          setCollaborationData(data);
        }
      })
      .catch(() => {
        if (active) {
          setCollaborationData({
            threads: [],
            members: [],
            activity: []
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader
          eyebrow="Team Collaboration"
          title="Keep discussions, owners, and blockers in one workspace"
          description="Track the active conversations around requirements and move quickly from a team discussion into the exact requirement that needs attention."
          actions={
            <Button as={NavLink} to="/requirements">
              Open requirements
            </Button>
          }
        />
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Open threads", value: collaborationData.threads.length },
          { label: "Active teammates", value: collaborationData.members.length },
          { label: "Recent updates", value: collaborationData.activity.length }
        ].map((item) => (
          <Card key={item.label} className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-white">{item.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader eyebrow="Thread Board" title="Current requirement discussions" />
          <div className="mt-6 grid gap-4">
            {collaborationData.threads.map((thread) => (
              <InfoCard key={thread.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{thread.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                      {thread.tag} - {thread.owner}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">{thread.status}</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{thread.excerpt}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                  <span>{thread.participants} participants</span>
                  <span>Updated {thread.updatedAt}</span>
                </div>
                <div className="mt-4">
                  <Button as={NavLink} to={`/requirements/${thread.tag}`} variant="secondary">
                    Open thread
                  </Button>
                </div>
              </InfoCard>
            ))}
          </div>
        </Card>

        <div className="grid gap-5">
          <Card>
            <CardHeader eyebrow="Team Board" title="Project collaborators" />
            <div className="mt-6 grid gap-3">
              {collaborationData.members.map((member) => (
                <InfoCard key={member.name}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{member.name}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{member.role}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{member.focus}</p>
                </InfoCard>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Activity Feed" title="Latest collaboration activity" />
            <div className="mt-6 grid gap-3">
              {collaborationData.activity.map((item) => (
                <InfoCard key={item.id}>
                  <p className="text-sm leading-7 text-slate-200">{item.text}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                    <span>{item.requirementId}</span>
                    <span>{item.time}</span>
                  </div>
                </InfoCard>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

export default CollaborationPage;
