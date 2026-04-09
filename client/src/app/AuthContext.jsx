import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { userProfile } from "../data/mockData";

const SESSION_KEY = "remt-auth-session";

const defaultSession = {
  isAuthenticated: false,
  user: null
};

const roleMap = {
  "alex.morgan@techcorp.io": "Admin",
  "sarah.kim@techcorp.io": "Analyst",
  "maria.liu@techcorp.io": "Stakeholder",
  "james.torres@techcorp.io": "Developer"
};

function buildSession(email) {
  const normalizedEmail = email?.trim().toLowerCase() || userProfile.email;
  const role = roleMap[normalizedEmail] || "Admin";
  const name = normalizedEmail === userProfile.email ? userProfile.name : normalizedEmail.split("@")[0].replace(".", " ");

  return {
    isAuthenticated: true,
    user: {
      ...userProfile,
      name: name
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      email: normalizedEmail,
      role,
      initials: name
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("")
    }
  };
}

const AuthContext = createContext({
  session: defaultSession,
  signIn: () => {},
  signOut: () => {}
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(defaultSession);

  useEffect(() => {
    const savedSession = window.localStorage.getItem(SESSION_KEY);

    if (!savedSession) {
      return;
    }

    try {
      const parsedSession = JSON.parse(savedSession);
      if (parsedSession?.isAuthenticated) {
        setSession(parsedSession);
      }
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  function signIn(email) {
    const nextSession = buildSession(email);
    setSession(nextSession);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    return nextSession;
  }

  function signOut() {
    setSession(defaultSession);
    window.localStorage.removeItem(SESSION_KEY);
  }

  const value = useMemo(
    () => ({
      session,
      signIn,
      signOut
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function hasRequiredRole(userRole, allowedRoles = []) {
  if (allowedRoles.length === 0) {
    return true;
  }

  return allowedRoles.includes(userRole);
}
