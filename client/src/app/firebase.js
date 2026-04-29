import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const hasFirebaseConfig = Boolean(firebaseConfig.projectId);

export const firebaseApp = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const functions = firebaseApp ? getFunctions(firebaseApp, "us-central1") : null;
export const db = firebaseApp
  ? initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache()
    })
  : null;
export let analytics = null;

if (firebaseApp && typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(firebaseApp);
      }
    })
    .catch(() => {
      analytics = null;
    });
}

if (functions && import.meta.env.DEV && import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === "true") {
  connectFunctionsEmulator(functions, "localhost", 5001);
}

function mapAuthError(error) {
  const code = error?.code || "";

  switch (code) {
    case "auth/invalid-credential":
      return "The email or password is incorrect.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters long.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was closed before it completed.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in popup. Allow popups and try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase yet.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase Authentication yet.";
    default:
      return error?.message || "Authentication could not be completed right now.";
  }
}

export async function signInWithEmail(email, password) {
  if (!firebaseAuth) {
    throw new Error("Firebase authentication is not configured yet.");
  }

  try {
    const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password);
    trackAppEvent("login", {
      method: "password"
    });

    return {
      mode: "firebase",
      user: credentials.user
    };
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function createAccountWithEmail(email, password) {
  if (!firebaseAuth) {
    throw new Error("Firebase authentication is not configured yet.");
  }

  try {
    const credentials = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    trackAppEvent("sign_up", {
      method: "password"
    });

    return {
      mode: "firebase",
      user: credentials.user
    };
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}

export async function signInWithGoogleProvider() {
  if (!firebaseAuth) {
    throw new Error("Firebase authentication is not configured yet.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });

  try {
    const result = await signInWithPopup(firebaseAuth, provider);
    trackAppEvent("login", {
      method: "google"
    });

    return {
      mode: "firebase",
      user: result.user
    };
    } catch (error) {
      throw new Error(mapAuthError(error));
    }
}

export function trackAppEvent(name, params = {}) {
  if (!analytics) {
    return;
  }

  logEvent(analytics, name, params);
}
