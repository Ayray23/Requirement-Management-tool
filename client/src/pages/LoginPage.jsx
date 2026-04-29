import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const { session } = useAuth();
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
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
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath, session.isAuthenticated]);

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
      await signInWithEmail(credentials.email, credentials.password);
      setLoginState({
        status: "success",
        message: "Signed in successfully. Loading your workspace..."
      });
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
      await signInWithGoogleProvider();
      setLoginState({
        status: "success",
        message: "Google sign-in successful. Loading your workspace..."
      });
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
              Govern requirements.
              <br />
              <span className="bg-remt-text bg-clip-text text-transparent">Operate like a real product team.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
              Secure sign-in, live Firestore data, role-governed actions, and operational visibility built into one
              requirement management workspace.
            </p>

            <div className="mt-10 flex flex-wrap gap-8">
              <Stat label="Live Firestore" value="100%" />
              <Stat label="Protected Actions" value="RBAC" />
              <Stat label="User Sessions" value="Persistent" />
            </div>

            <div className="mt-10 flex max-w-xl gap-4 rounded-3xl border border-fuchsia-400/20 bg-fuchsia-400/10 p-5 backdrop-blur-xl">
              <div className="pt-1 text-fuchsia-200">
                <Sparkles />
              </div>
              <div className="text-sm leading-7 text-slate-200">
                Google sign-in requires the Firebase Google provider to be enabled and your deployment domain to be
                added under Firebase Authentication authorized domains.
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center border-l border-white/10 bg-slate-950/50 p-6 backdrop-blur-xl sm:p-10">
          <Card className="w-full max-w-md bg-slate-950/70 p-8">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Welcome back</p>
            <h2 className="mt-3 text-3xl font-bold">Sign in to your workspace</h2>
            <p className="mt-2 text-sm text-slate-400">Use Firebase email/password or Google access to enter the workspace.</p>

            <form className="mt-8 grid gap-4" onSubmit={handleLogin}>
              <Field label="Email address">
                <TextInput name="email" type="email" value={credentials.email} onChange={handleChange} />
              </Field>

              <Field label="Password">
                <TextInput name="password" type="password" value={credentials.password} onChange={handleChange} />
              </Field>

              <Button className="mt-2 w-full" type="submit">
                Sign in
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

            <div className="mt-5 grid gap-3">
              <Button as={Link} className="w-full" to="/" variant="ghost">
                Sign in
              </Button>
              <Button as={Link} className="w-full" to="/register" variant="secondary">
                Create an account
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
