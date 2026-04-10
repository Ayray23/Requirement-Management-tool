import { useAuth } from "../app/AuthContext";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";
import { Field, TextArea, TextInput } from "../components/ui/Field";

function SettingsPage() {
  const { session } = useAuth();
  const profile = session.user;

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader eyebrow="Profile" title="Workspace identity" />

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Full name">
            <TextInput defaultValue={profile?.name || "Jordan Lee"} />
          </Field>
          <Field label="Role">
            <TextInput defaultValue={profile?.role || "Admin"} />
          </Field>
          <Field className="md:col-span-2" label="Email">
            <TextInput defaultValue={profile?.email || "jordan.lee@techcorp.io"} />
          </Field>
          <Field className="md:col-span-2" label="Bio">
            <TextArea
              className="min-h-[160px]"
              defaultValue="Senior Product Owner with 6+ years in agile software delivery and requirement engineering."
            />
          </Field>
        </div>
      </Card>

      <Card className="border-fuchsia-400/20 bg-fuchsia-400/10">
        <CardHeader eyebrow="Preferences" title="Notification controls" />

        <div className="mt-6 grid gap-3">
          {["Email notifications", "Requirement status changes", "AI conflict alerts", "Weekly summary digest"].map((item) => (
            <InfoCard key={item} className="flex items-center justify-between">
              <div>
                <strong className="block text-sm text-white">{item}</strong>
                <p className="mt-1 text-xs text-slate-400">Enabled for this workspace</p>
              </div>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                On
              </span>
            </InfoCard>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default SettingsPage;
