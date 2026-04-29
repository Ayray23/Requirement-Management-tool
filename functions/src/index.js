import admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const APP_ROLES = ["user", "admin", "super-admin"];
const APP_STATUSES = ["active", "suspended"];
const REQUIREMENTS_COLLECTION = "requirements";
const USERS_COLLECTION = "users";

function getApp() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  return admin.initializeApp();
}

function getDb() {
  return admin.firestore(getApp());
}

function getAuth() {
  return admin.auth(getApp());
}

function normalizeRole(role) {
  return APP_ROLES.includes(role) ? role : "user";
}

function normalizeStatus(status) {
  return APP_STATUSES.includes(status) ? status : "active";
}

function requireAuth(request) {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "You must be signed in to perform this action.");
  }
}

function requireRole(request, allowedRoles) {
  requireAuth(request);

  const role = normalizeRole(request.auth.token.role);
  if (!allowedRoles.includes(role)) {
    throw new HttpsError("permission-denied", "You do not have permission to perform this action.");
  }
}

function assertValidRole(role) {
  if (!APP_ROLES.includes(role)) {
    throw new HttpsError("invalid-argument", `Role must be one of: ${APP_ROLES.join(", ")}.`);
  }
}

function assertValidStatus(status) {
  if (!APP_STATUSES.includes(status)) {
    throw new HttpsError("invalid-argument", `Status must be one of: ${APP_STATUSES.join(", ")}.`);
  }
}

async function getUserSnapshot(uid) {
  return getDb().collection(USERS_COLLECTION).doc(uid).get();
}

function buildProfilePayload(request) {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const email = request.auth.token.email || "";
  const displayName = request.auth.token.name || email.split("@")[0] || "Workspace User";
  const photoURL = request.auth.token.picture || "";
  const role = normalizeRole(request.auth.token.role);

  return {
    email,
    displayName,
    photoURL,
    role,
    status: "active",
    lastLoginAt: now,
    updatedAt: now
  };
}

export const syncSessionProfile = onCall({ region: "us-central1" }, async (request) => {
  requireAuth(request);

  const db = getDb();
  const userRef = db.collection(USERS_COLLECTION).doc(request.auth.uid);
  const snapshot = await userRef.get();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const payload = buildProfilePayload(request);

  if (!snapshot.exists) {
    await userRef.set({
      ...payload,
      role: "user",
      status: "active",
      createdAt: now
    });

    return {
      uid: request.auth.uid,
      role: "user",
      status: "active"
    };
  }

  const current = snapshot.data();
  await userRef.set(
    {
      ...payload,
      role: normalizeRole(current.role),
      status: normalizeStatus(current.status)
    },
    { merge: true }
  );

  return {
    uid: request.auth.uid,
    role: normalizeRole(current.role),
    status: normalizeStatus(current.status)
  };
});

export const setUserRole = onCall({ region: "us-central1" }, async (request) => {
  requireRole(request, ["super-admin"]);

  const targetUid = String(request.data?.uid || "").trim();
  const nextRole = normalizeRole(String(request.data?.role || "").trim());

  if (!targetUid) {
    throw new HttpsError("invalid-argument", "A target user id is required.");
  }

  assertValidRole(nextRole);

  const targetSnapshot = await getUserSnapshot(targetUid);
  if (!targetSnapshot.exists) {
    throw new HttpsError("not-found", "Target user profile could not be found.");
  }

  const targetProfile = targetSnapshot.data();
  const currentRole = normalizeRole(targetProfile.role);

  if (targetUid === request.auth.uid && currentRole === "super-admin" && nextRole !== "super-admin") {
    throw new HttpsError("failed-precondition", "A super-admin cannot remove their own final super-admin access.");
  }

  await getAuth().setCustomUserClaims(targetUid, {
    ...(await getAuth().getUser(targetUid)).customClaims,
    role: nextRole
  });

  await targetSnapshot.ref.set(
    {
      role: nextRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: request.auth.uid
    },
    { merge: true }
  );

  return {
    ok: true,
    uid: targetUid,
    role: nextRole
  };
});

export const setUserStatus = onCall({ region: "us-central1" }, async (request) => {
  requireRole(request, ["admin", "super-admin"]);

  const actorRole = normalizeRole(request.auth.token.role);
  const targetUid = String(request.data?.uid || "").trim();
  const nextStatus = normalizeStatus(String(request.data?.status || "").trim());

  if (!targetUid) {
    throw new HttpsError("invalid-argument", "A target user id is required.");
  }

  assertValidStatus(nextStatus);

  const targetSnapshot = await getUserSnapshot(targetUid);
  if (!targetSnapshot.exists) {
    throw new HttpsError("not-found", "Target user profile could not be found.");
  }

  const targetProfile = targetSnapshot.data();
  const targetRole = normalizeRole(targetProfile.role);

  if (targetRole === "super-admin" && actorRole !== "super-admin") {
    throw new HttpsError("permission-denied", "Only a super-admin can change another super-admin.");
  }

  if (targetUid === request.auth.uid && nextStatus === "suspended") {
    throw new HttpsError("failed-precondition", "You cannot suspend your own account.");
  }

  await getAuth().updateUser(targetUid, {
    disabled: nextStatus === "suspended"
  });

  await targetSnapshot.ref.set(
    {
      status: nextStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: request.auth.uid
    },
    { merge: true }
  );

  return {
    ok: true,
    uid: targetUid,
    status: nextStatus
  };
});

export const deleteRequirementCascade = onCall({ region: "us-central1" }, async (request) => {
  requireRole(request, ["admin", "super-admin"]);

  const requirementId = String(request.data?.requirementId || "").trim();
  if (!requirementId) {
    throw new HttpsError("invalid-argument", "A requirement id is required.");
  }

  const db = getDb();
  const requirementRef = db.collection(REQUIREMENTS_COLLECTION).doc(requirementId);
  const requirementSnapshot = await requirementRef.get();

  if (!requirementSnapshot.exists) {
    throw new HttpsError("not-found", "Requirement could not be found.");
  }

  const [commentsSnapshot, activitySnapshot] = await Promise.all([
    requirementRef.collection("comments").get(),
    requirementRef.collection("activity").get()
  ]);

  const batch = db.batch();

  commentsSnapshot.docs.forEach((document) => {
    batch.delete(document.ref);
  });

  activitySnapshot.docs.forEach((document) => {
    batch.delete(document.ref);
  });

  batch.delete(requirementRef);
  await batch.commit();

  return {
    ok: true,
    requirementId
  };
});
