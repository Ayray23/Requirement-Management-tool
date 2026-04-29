import admin from "firebase-admin";

let firebaseApp = null;
let firestoreDb = null;
let authInstance = null;

export function isFirebaseConfigured() {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;
  return Boolean(FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY);
}

export function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (!isFirebaseConfigured()) {
    return null;
  }

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });

  return firebaseApp;
}

export function getFirestoreDb() {
  const app = initializeFirebase();

  if (!app) {
    throw new Error("Firebase Admin is not configured for this environment.");
  }

  if (!firestoreDb) {
    firestoreDb = admin.firestore(app);
  }

  return firestoreDb;
}

export function getAdminAuth() {
  const app = initializeFirebase();

  if (!app) {
    throw new Error("Firebase Admin is not configured for this environment.");
  }

  if (!authInstance) {
    authInstance = admin.auth(app);
  }

  return authInstance;
}
