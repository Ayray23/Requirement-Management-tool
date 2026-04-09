import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import { ChevronRight, Sparkles } from "../app/icons";
import { signInWithEmail, signInWithGoogleProvider } from "../app/firebase";
import Stat from "../components/Stat";
import Button from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Field, TextInput } from "../components/ui/Field";

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, signIn } = useAuth();
  const [credentials, setCredentials] = useState({
    email: "alex.morgan@techcorp.io",
    password: "password123"
  });
  const [loginState, setLoginState] = useState({
    status: "idle",
    message: ""
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setCredentials((current) => ({
      ...current,
      [name]: value
    }));
  }

  const redirectPath = location.state?.from || "/dashboard";

  useEffect(() => {
    if (session.isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, session.isAuthenticated]);

  async function handleLogin(event) {
    event.preventDefault();

    if (!credentials.email.includes("@")) {
      setLoginState({
        status: "error",
        message: "Please enter a valid email address."
      });
      return;
    }

    if (credentials.password.trim().length < 6) {
      setLoginState({
        status: "error",
        message: "Password should be at least 6 characters long."
      });
      return;
    }

    setLoginState({
      status: "loading",
      message: "Signing you in..."
    });

    try {
      const result = await signInWithEmail(credentials.email, credentials.password);
      signIn(credentials.email);
      setLoginState({
        status: "success",
        message:
          result.mode === "firebase"
            ? "Signed in with Firebase. Redirecting to your workspace..."
            : "Firebase config not found, so demo sign-in was used. Redirecting to your workspace..."
      });

      window.setTimeout(() => {
        navigate(redirectPath);
      }, 700);
    } catch (error) {
      setLoginState({
        status: "error",
        message: error.message || "Could not sign in right now."
      });
    }
  }

  async function handleGoogleSignIn() {
    setLoginState({
      status: "loading",
      message: "Opening Google sign-in..."
    });

    try {
      const result = await signInWithGoogleProvider();
      signIn(credentials.email);
      setLoginState({
        status: "success",
        message:
          result.mode === "firebase"
            ? "Google sign-in successful. Redirecting to your workspace..."
            : "Firebase config not found, so demo Google sign-in was used. Redirecting to your workspace..."
      });

      window.setTimeout(() => {
        navigate(redirectPath);
      }, 700);
    } catch (error) {
      setLoginState({
        status: "error",
        message: error.message || "Google sign-in could not be completed."
      });
    }
  }

  return (
    <main className="min-h-screen bg-remt-bg bg-remt-scene font-body text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <section className="relative overflow-hidden px-6 py-12 sm:px-12 lg:px-20">
          <div className="mx-auto max-w-2xl">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-remt-brand font-display text-2xl font-bold text-white">
              R
            </div>
            <span className="mt-4 inline-block uppercase tracking-[0.24em] text-slate-300">REMT Platform</span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-none sm:text-6xl">
              Elicit. Manage.
              <br />
              <span className="bg-remt-text bg-clip-text text-transparent">Ship requirements with confidence.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
              A smart requirement elicitation and management tool for capturing stakeholder needs, tracking delivery
              readiness, and presenting final-year work like a real product team built it.
            </p>

            <div className="mt-10 flex flex-wrap gap-8">
              <Stat label="Active Projects" value="12" />
              <Stat label="Conflict Alerts" value="07" />
              <Stat label="Team Velocity" value="96%" />
            </div>

            <div className="mt-10 flex max-w-xl gap-4 rounded-3xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5 backdrop-blur-xl">
              <div className="pt-1 text-fuchsia-200">
                <Sparkles />
              </div>
              <div className="text-sm leading-7 text-slate-200">
                REMT AI identified 3 ambiguous requirements in Sprint 7 and suggested refinements before development.
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center border-l border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl sm:p-10">
          <Card className="w-full max-w-md bg-slate-950/70 p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Welcome back</p>
            <h2 className="mt-3 text-3xl font-bold">Sign in to your workspace</h2>
            <p className="mt-2 text-sm text-slate-400">React + Tailwind login flow with Firebase auth and demo fallback.</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              Demo roles: Admin `alex.morgan@techcorp.io`, Analyst `sarah.kim@techcorp.io`, Stakeholder `maria.liu@techcorp.io`, Developer `james.torres@techcorp.io`
            </div>

            <form className="mt-8 grid gap-4" onSubmit={handleLogin}>
              <Field label="Email address">
                <TextInput name="email" type="email" value={credentials.email} onChange={handleChange} />
              </Field>

              <Field label="Password">
                <TextInput name="password" type="password" value={credentials.password} onChange={handleChange} />
              </Field>

              <Button className="mt-2 w-full" type="submit">
                Enter workspace
                <ChevronRight />
              </Button>
            </form>

            {loginState.message ? (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  loginState.status === "success"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : loginState.status === "loading"
                      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-100"
                      : "border-red-400/20 bg-red-400/10 text-red-200"
                }`}
              >
                {loginState.message}
              </div>
            ) : null}

            <Button className="mt-4 w-full" type="button" variant="secondary" onClick={handleGoogleSignIn}>
              Continue with Google
            </Button>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
