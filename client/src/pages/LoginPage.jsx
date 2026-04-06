import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Sparkles } from "../app/icons";
import Stat from "../components/Stat";

function LoginPage() {
  const navigate = useNavigate();
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

  function handleLogin(event) {
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
      status: "success",
      message: "Signed in successfully. Redirecting to your workspace..."
    });

    window.setTimeout(() => {
      navigate("/dashboard");
    }, 700);
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
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-slate-950/70 p-8 shadow-glow">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Welcome back</p>
            <h2 className="mt-3 text-3xl font-bold">Sign in to your workspace</h2>
            <p className="mt-2 text-sm text-slate-400">Tailwind-based auth screen matching the product direction.</p>

            <form className="mt-8 grid gap-4" onSubmit={handleLogin}>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">Email address</span>
                <input
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-fuchsia-400/40"
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleChange}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">Password</span>
                <input
                  className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-500 focus:border-fuchsia-400/40"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleChange}
                />
              </label>

              <button
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 font-semibold text-white"
                type="submit"
              >
                Enter workspace
                <ChevronRight />
              </button>
            </form>

            {loginState.message ? (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  loginState.status === "success"
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : "border-red-400/20 bg-red-400/10 text-red-200"
                }`}
              >
                {loginState.message}
              </div>
            ) : null}

            <button
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-100"
              type="button"
            >
              Continue with Google
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
