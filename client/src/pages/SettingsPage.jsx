import { useState } from "react";
import { useAuth } from "../app/AuthContext";
import { updateOwnProfile } from "../app/services/userService";
import { Card, CardHeader, InfoCard } from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Field, TextArea, TextInput } from "../components/ui/Field";

function SettingsPage() {
  const { session } = useAuth();
  const profile = session.user;
  const [form, setForm] = useState({
    displayName: profile?.name || "",
    title: profile?.title || "",
    department: profile?.department || "",
    phoneNumber: ""
  });
  const [saveState, setSaveState] = useState({
    status: "idle",
    message: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!profile?.uid) {
      return;
    }

    setSaveState({
      status: "loading",
      message: "Saving profile changes..."
    });

    try {
      await updateOwnProfile(profile.uid, form);
      setSaveState({
        status: "success",
        message: "Profile updated successfully."
      });
    } catch (error) {
      setSaveState({
        status: "error",
        message: error.message || "Could not save your profile changes."
      });
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader eyebrow="Profile" title="Workspace identity" />

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Full name">
            <TextInput name="displayName" value={form.displayName} onChange={handleChange} />
          </Field>
          <Field label="System role">
            <TextInput defaultValue={profile?.role || ""} disabled />
          </Field>
          <Field className="md:col-span-2" label="Email">
            <TextInput defaultValue={profile?.email || ""} disabled />
          </Field>
          <Field label="Job title">
            <TextInput name="title" value={form.title} onChange={handleChange} />
          </Field>
          <Field label="Department">
            <TextInput name="department" value={form.department} onChange={handleChange} />
          </Field>
          <Field className="md:col-span-2" label="Phone number">
            <TextInput name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
          </Field>
          <Field className="md:col-span-2" label="Access summary">
            <TextArea
              className="min-h-[160px]"
              disabled
              defaultValue={`Role: ${profile?.role || "user"}\nStatus: ${profile?.status || "active"}\nPermissions are enforced with Firebase custom claims and Firestore security rules.`}
            />
          </Field>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit">{saveState.status === "loading" ? "Saving..." : "Save changes"}</Button>
          </div>
        </form>

        {saveState.message ? (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
              saveState.status === "success"
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : saveState.status === "loading"
                  ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                  : "border-red-400/20 bg-red-400/10 text-red-200"
            }`}
          >
            {saveState.message}
          </div>
        ) : null}
      </Card>

      <Card className="border-fuchsia-400/20 bg-fuchsia-400/10">
        <CardHeader eyebrow="Preferences" title="Notification controls" />

        <div className="mt-6 grid gap-3">
          {["Email notifications", "Requirement status changes", "Access governance notices", "Weekly summary digest"].map((item) => (
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
