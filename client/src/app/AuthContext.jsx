import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { firebaseAuth } from "./firebase";

const SESSION_KEY = "remt-auth-session";

const defaultUser = {
  name: "Jordan Lee",
  role: "Admin",
  email: "jordan.lee@techcorp.io",
  team: "Platform Strategy",
  initials: "JL"
};

const defaultSession = {
  loading: true,
  isAuthenticated: false,
  user: null
};

const roleMap = {
  "jordan.lee@techcorp.io": "Admin",
  "sarah.kim@techcorp.io": "Analyst",
  "maria.liu@techcorp.io": "Stakeholder",
  "james.torres@techcorp.io": "Developer"
};

function formatNameFromEmail(email) {
  return (email || defaultUser.email)
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildSession(userInput) {
  const normalizedEmail =
    typeof userInput === "string" ? userInput.trim().toLowerCase() : userInput?.email?.trim().toLowerCase() || defaultUser.email;
  const resolvedName =
    typeof userInput === "string"
      ? formatNameFromEmail(normalizedEmail)
      : userInput?.displayName || userInput?.name || formatNameFromEmail(normalizedEmail);
  const role = roleMap[normalizedEmail] || "Admin";

  return {
    loading: false,
    isAuthenticated: true,
    user: {
      ...defaultUser,
      name: resolvedName,
      email: normalizedEmail,
      role,
      initials: resolvedName
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
    if (firebaseAuth) {
      const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        if (firebaseUser) {
          const nextSession = buildSession({
            email: firebaseUser.email,
            displayName: firebaseUser.displayName
          });
          setSession(nextSession);
          window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
          return;
        }

        const savedSession = window.localStorage.getItem(SESSION_KEY);

        if (savedSession) {
          try {
            const parsedSession = JSON.parse(savedSession);

            if (parsedSession?.isAuthenticated) {
              setSession({
                ...parsedSession,
                loading: false
              });
              return;
            }
          } catch {
            window.localStorage.removeItem(SESSION_KEY);
          }
        }

        setSession({
          loading: false,
          isAuthenticated: false,
          user: null
        });
      });

      return unsubscribe;
    }

    const savedSession = window.localStorage.getItem(SESSION_KEY);

    if (!savedSession) {
      setSession({
        loading: false,
        isAuthenticated: false,
        user: null
      });
      return;
    }

    try {
      const parsedSession = JSON.parse(savedSession);
      if (parsedSession?.isAuthenticated) {
        setSession({
          ...parsedSession,
          loading: false
        });
        return;
      }
    } catch {
      window.localStorage.removeItem(SESSION_KEY);
    }

    setSession({
      loading: false,
      isAuthenticated: false,
      user: null
    });
  }, []);

  function signIn(userInput) {
    const nextSession = buildSession(userInput);
    setSession(nextSession);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
    return nextSession;
  }

  async function signOut() {
    if (firebaseAuth) {
      try {
        await firebaseSignOut(firebaseAuth);
      } catch {
        // Fall through to local cleanup.
      }
    }

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
