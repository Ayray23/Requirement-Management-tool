import { collection, getDocs, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase";
import { formatUserProfile } from "./userService";

const USERS_COLLECTION = "users";
const REQUIREMENTS_COLLECTION = "requirements";

function ensureDb() {
  if (!db) {
    throw new Error("Firebase is not configured for this environment.");
  }
}

function ensureFunctions() {
  if (!functions) {
    throw new Error("Firebase Functions is not configured for this environment.");
  }
}

export function subscribeToUsers(callback, onError) {
  ensureDb();
  const usersQuery = query(collection(db, USERS_COLLECTION), orderBy("createdAt", "desc"), limit(50));

  return onSnapshot(
    usersQuery,
    (snapshot) => {
      callback(snapshot.docs.map((document) => formatUserProfile(document.id, document.data())));
    },
    onError
  );
}

export async function getAdminMetrics() {
  ensureDb();
  const [usersSnapshot, requirementsSnapshot] = await Promise.all([
    getDocs(collection(db, USERS_COLLECTION)),
    getDocs(collection(db, REQUIREMENTS_COLLECTION))
  ]);

  const users = usersSnapshot.docs.map((document) => formatUserProfile(document.id, document.data()));
  const requirements = requirementsSnapshot.docs.map((document) => document.data());

  return {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.status === "active").length,
    suspendedUsers: users.filter((user) => user.status === "suspended").length,
    adminUsers: users.filter((user) => user.role === "admin" || user.role === "super-admin").length,
    totalRequirements: requirements.length,
    blockedRequirements: requirements.filter((item) => item.status === "Blocked").length,
    inReviewRequirements: requirements.filter((item) => item.status === "In Review").length,
    recentUsers: users.slice(0, 5)
  };
}

export async function setUserRoleAction(uid, role) {
  ensureFunctions();
  const mutateRole = httpsCallable(functions, "setUserRole");
  const result = await mutateRole({ uid, role });
  return result.data;
}

export async function setUserStatusAction(uid, status) {
  ensureFunctions();
  const mutateStatus = httpsCallable(functions, "setUserStatus");
  const result = await mutateStatus({ uid, status });
  return result.data;
}

export async function deleteRequirementCascadeAction(requirementId) {
  ensureFunctions();
  const deleteRequirement = httpsCallable(functions, "deleteRequirementCascade");
  const result = await deleteRequirement({ requirementId });
  return result.data;
}
