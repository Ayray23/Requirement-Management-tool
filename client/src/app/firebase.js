import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const hasFirebaseConfig = Boolean(firebaseConfig.projectId);

export const firebaseApp = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp
  ? initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache()
    })
  : null;

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
    return {
      mode: "local",
      user: {
        email,
        displayName: "Workspace User"
      }
    };
  }

  try {
    const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password);

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
    return {
      mode: "local",
      user: {
        email,
        displayName: "Workspace User"
      }
    };
  }

  try {
    const credentials = await createUserWithEmailAndPassword(firebaseAuth, email, password);

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
    return {
      mode: "local",
      user: {
        email: "workspace.google@remt.app",
        displayName: "Workspace Google User"
      }
    };
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });

  try {
    const result = await signInWithPopup(firebaseAuth, provider);

    return {
      mode: "firebase",
      user: result.user
    };
  } catch (error) {
    throw new Error(mapAuthError(error));
  }
}
