import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

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

export async function signInWithEmail(email, password) {
  if (!firebaseAuth) {
    return {
      mode: "demo",
      user: {
        email,
        displayName: "Demo User"
      }
    };
  }

  const credentials = await signInWithEmailAndPassword(firebaseAuth, email, password);

  return {
    mode: "firebase",
    user: credentials.user
  };
}

export async function signInWithGoogleProvider() {
  if (!firebaseAuth) {
    return {
      mode: "demo",
      user: {
        email: "demo.google@remt.app",
        displayName: "Demo Google User"
      }
    };
  }

  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(firebaseAuth, provider);

  return {
    mode: "firebase",
    user: result.user
  };
}
