import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { firebaseAuth } from "./firebase";
import { normalizeRole, normalizeStatus } from "./roles";
import { subscribeToUserProfile, syncCurrentUserProfile } from "./services/userService";

const SESSION_KEY = "remt-auth-session";

const defaultSession = {
  loading: true,
  isAuthenticated: false,
  user: null,
  claims: {
    role: "user",
    status: "active"
  }
};

function formatNameFromEmail(email) {
  return (email || "workspace.user@remt.app")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildSession(firebaseUser, profile, claims = {}) {
  const email = firebaseUser?.email?.trim().toLowerCase() || profile?.email?.trim().toLowerCase() || "";
  const name = profile?.displayName || firebaseUser?.displayName || formatNameFromEmail(email);
  const role = normalizeRole(claims.role || profile?.role);
  const status = normalizeStatus(claims.status || profile?.status);

  return {
    loading: false,
    isAuthenticated: status === "active",
    user: {
      uid: firebaseUser?.uid || profile?.uid || "",
      name,
      email,
      role,
      status,
      department: profile?.department || "Product Delivery",
      title: profile?.title || "Workspace Member",
      photoURL: profile?.photoURL || firebaseUser?.photoURL || "",
      initials: name
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("")
    },
    claims: {
      role,
      status
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
    let unsubscribeProfile = null;

    if (!firebaseAuth) {
      setSession({
        loading: false,
        isAuthenticated: false,
        user: null,
        claims: {
          role: "user",
          status: "active"
        }
      });
      return undefined;
    }

    const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        window.localStorage.removeItem(SESSION_KEY);
        setSession({
          loading: false,
          isAuthenticated: false,
          user: null,
          claims: {
            role: "user",
            status: "active"
          }
        });
        return;
      }

      const tokenResult = await firebaseUser.getIdTokenResult();
      const claims = {
        role: normalizeRole(tokenResult.claims.role),
        status: normalizeStatus(tokenResult.claims.status)
      };
      const profile = await syncCurrentUserProfile(firebaseUser, claims);
      const nextSession = buildSession(firebaseUser, profile, claims);

      setSession(nextSession);
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));

      if (unsubscribeProfile) {
        unsubscribeProfile();
      }

      unsubscribeProfile = subscribeToUserProfile(
        firebaseUser.uid,
        (nextProfile) => {
          if (!nextProfile) {
            return;
          }

          const syncedSession = buildSession(firebaseUser, nextProfile, {
            role: normalizeRole(nextProfile.role),
            status: normalizeStatus(nextProfile.status)
          });

          setSession(syncedSession);
          window.localStorage.setItem(SESSION_KEY, JSON.stringify(syncedSession));
        },
        () => {}
      );
    });

    return () => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }

      unsubscribeAuth();
    };
  }, []);

  function signIn() {
    return null;
  }

  async function signOut() {
    if (firebaseAuth) {
      try {
        await firebaseSignOut(firebaseAuth);
      } catch {
        // Fall through to local cleanup.
      }
    }

    setSession({
      loading: false,
      isAuthenticated: false,
      user: null,
      claims: {
        role: "user",
        status: "active"
      }
    });
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
