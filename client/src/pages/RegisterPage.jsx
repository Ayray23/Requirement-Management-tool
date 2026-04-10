import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import { ChevronRight, Sparkles } from "../app/icons";
import { createAccountWithEmail, signInWithGoogleProvider } from "../app/firebase";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field, TextInput } from "../components/ui/Field";

function RegisterPage() {
  const navigate = useNavigate();
  const { session, signIn } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [registerState, setRegisterState] = useState({
    status: "idle",
    message: ""
  });

  useEffect(() => {
    if (session.isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, session.isAuthenticated]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleRegister(event) {
    event.preventDefault();

    if (!form.email.includes("@")) {
      setRegisterState({
        status: "error",
        message: "Please enter a valid email address."
      });
      return;
    }

    if (form.password.trim().length < 6) {
      setRegisterState({
        status: "error",
        message: "Password should be at least 6 characters long."
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setRegisterState({
        status: "error",
        message: "Passwords do not match."
      });
      return;
    }

    setRegisterState({
      status: "loading",
      message: "Creating your account..."
    });

    try {
      const result = await createAccountWithEmail(form.email, form.password);
      signIn(result.user || form.email);
      setRegisterState({
        status: "success",
        message:
          result.mode === "firebase"
            ? "Account created successfully. Redirecting to your workspace..."
            : "Firebase is not configured in this environment yet, so local workspace access was used. Redirecting to your workspace..."
      });

      window.setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      setRegisterState({
        status: "error",
        message: error.message || "Could not create your account right now."
      });
    }
  }

  async function handleGoogleSignUp() {
    setRegisterState({
      status: "loading",
      message: "Opening Google account creation..."
    });

    try {
      const result = await signInWithGoogleProvider();
      signIn(result.user || form.email);
      setRegisterState({
        status: "success",
        message:
          result.mode === "firebase"
            ? "Google account connected successfully. Redirecting to your workspace..."
            : "Firebase is not configured in this environment yet, so local workspace access was used. Redirecting to your workspace..."
      });

      window.setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      setRegisterState({
        status: "error",
        message: error.message || "Google account creation could not be completed."
      });
    }
  }

  return (
    <main className="min-h-screen bg-remt-bg bg-remt-scene font-body text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden px-6 py-12 sm:px-12 lg:px-20">
          <div className="mx-auto max-w-2xl">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-remt-brand font-display text-2xl font-bold text-white">
              R
            </div>
            <span className="mt-4 inline-block uppercase tracking-[0.24em] text-slate-300">REMT Platform</span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-none sm:text-6xl">
              Create your
              <br />
              <span className="bg-remt-text bg-clip-text text-transparent">workspace account.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
              Set up access for analysts, stakeholders, and developers while keeping the same design language already built into the platform.
            </p>

            <div className="mt-10 flex max-w-xl gap-4 rounded-3xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5 backdrop-blur-xl">
              <div className="pt-1 text-fuchsia-200">
                <Sparkles />
              </div>
              <div className="text-sm leading-7 text-slate-200">
                If Google access fails, make sure the Vercel domain is added to Firebase Authentication authorized domains and the Google provider is enabled.
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center border-l border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl sm:p-10">
          <Card className="w-full max-w-md bg-slate-950/70 p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Get started</p>
            <h2 className="mt-3 text-3xl font-bold">Create account</h2>
            <p className="mt-2 text-sm text-slate-400">Register with email/password or continue with Google.</p>

            <form className="mt-8 grid gap-4" onSubmit={handleRegister}>
              <Field label="Email address">
                <TextInput name="email" type="email" value={form.email} onChange={handleChange} />
              </Field>
              <Field label="Password">
                <TextInput name="password" type="password" value={form.password} onChange={handleChange} />
              </Field>
              <Field label="Confirm password">
                <TextInput name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
              </Field>

              <Button className="mt-2 w-full" type="submit">
                Create account
                <ChevronRight />
              </Button>
            </form>

            {registerState.message ? (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  registerState.status === "success"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : registerState.status === "loading"
                      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                      : "border-red-400/20 bg-red-400/10 text-red-200"
                }`}
              >
                {registerState.message}
              </div>
            ) : null}

            <Button className="mt-4 w-full" type="button" variant="secondary" onClick={handleGoogleSignUp}>
              Continue with Google
            </Button>

            <div className="mt-5 grid gap-3">
              <Button as={Link} className="w-full" to="/" variant="secondary">
                Sign in
              </Button>
              <Button as={Link} className="w-full" to="/register" variant="ghost">
                Create an account
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default RegisterPage;
