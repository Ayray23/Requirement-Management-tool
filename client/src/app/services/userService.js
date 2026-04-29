import { collection, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { normalizeRole, normalizeStatus } from "../roles";

const USERS_COLLECTION = "users";

function ensureDb() {
  if (!db) {
    throw new Error("Firebase is not configured for this environment.");
  }
}

function formatNameFromEmail(email) {
  return (email || "workspace.user@remt.app")
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatUserProfile(uid, data = {}, roleOverride, statusOverride) {
  const email = data.email || "";
  const displayName = data.displayName || formatNameFromEmail(email || uid);
  const role = normalizeRole(roleOverride || data.role);
  const status = normalizeStatus(statusOverride || data.status);

  return {
    uid,
    email,
    displayName,
    photoURL: data.photoURL || "",
    role,
    status,
    department: data.department || "Product Delivery",
    title: data.title || "Workspace Member",
    phoneNumber: data.phoneNumber || "",
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    lastLoginAt: data.lastLoginAt || null
  };
}

export async function syncCurrentUserProfile(firebaseUser, claims = {}) {
  ensureDb();

  const userRef = doc(collection(db, USERS_COLLECTION), firebaseUser.uid);
  const snapshot = await getDoc(userRef);
  const email = firebaseUser.email || "";
  const displayName = firebaseUser.displayName || formatNameFromEmail(email);
  const photoURL = firebaseUser.photoURL || "";

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      email,
      displayName,
      photoURL,
      role: "user",
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    });

    return formatUserProfile(
      firebaseUser.uid,
      {
        email,
        displayName,
        photoURL,
        role: "user",
        status: "active"
      },
      claims.role,
      claims.status
    );
  }

  const currentProfile = snapshot.data();

  await updateDoc(userRef, {
    email,
    displayName,
    photoURL,
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  });

  return formatUserProfile(firebaseUser.uid, currentProfile, claims.role, claims.status || currentProfile.status);
}

export function subscribeToUserProfile(uid, callback, onError) {
  ensureDb();
  return onSnapshot(doc(db, USERS_COLLECTION, uid), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback(formatUserProfile(snapshot.id, snapshot.data()));
  }, onError);
}

export async function updateOwnProfile(uid, data) {
  ensureDb();

  const updates = {
    displayName: data.displayName || "",
    department: data.department || "",
    title: data.title || "",
    phoneNumber: data.phoneNumber || "",
    updatedAt: serverTimestamp()
  };

  await updateDoc(doc(db, USERS_COLLECTION, uid), updates);
}
