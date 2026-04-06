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
    <main className="auth-page">
      <section className="hero-panel">
        <div className="brand-mark">R</div>
        <span className="brand-title">REMT Platform</span>
        <h1>
          Elicit. Manage.
          <br />
          <span>Ship requirements with confidence.</span>
        </h1>
        <p>
          A smart requirement elicitation and management tool for capturing stakeholder needs, tracking delivery
          readiness, and presenting final-year work like a real product team built it.
        </p>
        <div className="hero-stats">
          <Stat label="Active Projects" value="12" />
          <Stat label="Conflict Alerts" value="07" />
          <Stat label="Team Velocity" value="96%" />
        </div>
        <div className="hero-note">
          <Sparkles />
          <div>REMT AI identified 3 ambiguous requirements in Sprint 7 and suggested refinements before development.</div>
        </div>
      </section>
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to your workspace</h2>
        <p className="muted">Prototype-ready auth screen matching the provided design language.</p>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email address</label>
            <input name="email" type="email" value={credentials.email} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input name="password" type="password" value={credentials.password} onChange={handleChange} />
          </div>
          <button className="primary-button auth-submit" type="submit">
            Enter workspace
            <ChevronRight />
          </button>
        </form>
        {loginState.message ? <div className={`auth-feedback ${loginState.status}`}>{loginState.message}</div> : null}
        <button className="secondary-button" type="button">
          Continue with Google
        </button>
      </section>
    </main>
  );
}

export default LoginPage;
