import admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const APP_ROLES = ["user", "admin", "super-admin"];
const APP_STATUSES = ["active", "suspended"];
const REQUIREMENTS_COLLECTION = "requirements";
const USERS_COLLECTION = "users";
const NOTIFICATIONS_COLLECTION = "notifications";

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

function createTimestamp() {
  return admin.firestore.FieldValue.serverTimestamp();
}

function mapRoleLabel(role) {
  if (role === "super-admin") {
    return "admin";
  }

  if (role === "admin") {
    return "analyst";
  }

  return "stakeholder";
}

async function createNotifications(recipientUids, payload) {
  const uniqueRecipients = [...new Set(recipientUids.filter(Boolean))];

  await Promise.all(
    uniqueRecipients.map((recipientUid) =>
      getDb().collection(NOTIFICATIONS_COLLECTION).add({
        ...payload,
        recipientUid,
        read: false,
        createdAt: createTimestamp()
      })
    )
  );
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

  const [commentsSnapshot, activitySnapshot, versionsSnapshot] = await Promise.all([
    requirementRef.collection("comments").get(),
    requirementRef.collection("activity").get(),
    requirementRef.collection("versions").get()
  ]);

  const batch = db.batch();

  commentsSnapshot.docs.forEach((document) => {
    batch.delete(document.ref);
  });

  activitySnapshot.docs.forEach((document) => {
    batch.delete(document.ref);
  });

  versionsSnapshot.docs.forEach((document) => {
    batch.delete(document.ref);
  });

  batch.delete(requirementRef);
  await batch.commit();

  return {
    ok: true,
    requirementId
  };
});

export const addRequirementComment = onCall({ region: "us-central1" }, async (request) => {
  requireAuth(request);

  const requirementId = String(request.data?.requirementId || "").trim();
  const message = String(request.data?.message || "").trim();

  if (!requirementId || !message) {
    throw new HttpsError("invalid-argument", "Requirement id and comment message are required.");
  }

  const db = getDb();
  const requirementRef = db.collection(REQUIREMENTS_COLLECTION).doc(requirementId);
  const snapshot = await requirementRef.get();

  if (!snapshot.exists) {
    throw new HttpsError("not-found", "Requirement could not be found.");
  }

  const requirement = snapshot.data();
  const authorName = String(request.data?.authorName || request.auth.token.name || "Workspace User");
  const authorRole = mapRoleLabel(normalizeRole(request.auth.token.role));
  const commentRef = requirementRef.collection("comments").doc();
  const activityRef = requirementRef.collection("activity").doc();

  await db.runTransaction(async (transaction) => {
    transaction.set(commentRef, {
      authorName,
      authorUid: request.auth.uid,
      authorRole,
      message,
      createdAt: createTimestamp()
    });

    transaction.set(activityRef, {
      type: "comment",
      text: `${authorName} added a new discussion comment.`,
      actorName: authorName,
      actorUid: request.auth.uid,
      createdAt: createTimestamp()
    });

    transaction.update(requirementRef, {
      commentCount: Number(requirement.commentCount || 0) + 1,
      activityCount: Number(requirement.activityCount || 0) + 1,
      updatedByUid: request.auth.uid,
      updatedByName: authorName,
      updatedAt: createTimestamp()
    });
  });

  await createNotifications([requirement.ownerUid, requirement.createdByUid], {
    type: "comment",
    title: `New comment on ${requirementId}`,
    message,
    requirementId
  });

  return {
    id: commentRef.id,
    authorName,
    authorUid: request.auth.uid,
    authorRole,
    message,
    createdAt: new Date().toISOString(),
    time: "Just now"
  };
});

export const reviewRequirement = onCall({ region: "us-central1" }, async (request) => {
  requireAuth(request);

  const requirementId = String(request.data?.requirementId || "").trim();
  const decision = String(request.data?.decision || "").trim();
  const comment = String(request.data?.comment || "").trim();

  if (!requirementId || !["Approved", "Rejected"].includes(decision)) {
    throw new HttpsError("invalid-argument", "Requirement id and a valid decision are required.");
  }

  const db = getDb();
  const requirementRef = db.collection(REQUIREMENTS_COLLECTION).doc(requirementId);
  const snapshot = await requirementRef.get();

  if (!snapshot.exists) {
    throw new HttpsError("not-found", "Requirement could not be found.");
  }

  const requirement = snapshot.data();
  const actorName = String(request.data?.actorName || request.auth.token.name || "Workspace User");
  const actorRole = mapRoleLabel(normalizeRole(request.auth.token.role));
  const approvals = Array.isArray(requirement.approvals) ? requirement.approvals : [];
  const filteredApprovals = approvals.filter((item) => item.actorUid !== request.auth.uid);
  const nextApproval = {
    id: `approval-${Date.now()}`,
    decision,
    actorName,
    actorUid: request.auth.uid,
    actorRole,
    comment,
    createdAt: new Date().toISOString()
  };
  const versionsRef = requirementRef.collection("versions").doc();
  const activityRef = requirementRef.collection("activity").doc();

  await db.runTransaction(async (transaction) => {
    transaction.set(versionsRef, {
      title: requirement.title || "Requirement snapshot",
      description: requirement.description || "",
      type: requirement.type || "Functional",
      priority: requirement.priority || "Medium",
      status: requirement.status || "Pending",
      stakeholder: requirement.stakeholder || requirement.ownerName || "Unassigned",
      project: requirement.project || "Core Platform",
      module: requirement.module || "General",
      editorName: actorName,
      editorUid: request.auth.uid,
      changeNote: `Workflow decision recorded: ${decision}.`,
      createdAt: createTimestamp()
    });

    transaction.set(activityRef, {
      type: "approval",
      text: `${actorName} marked this requirement as ${decision.toLowerCase()}.`,
      actorName,
      actorUid: request.auth.uid,
      createdAt: createTimestamp()
    });

    transaction.update(requirementRef, {
      status: decision,
      approvals: [...filteredApprovals, nextApproval],
      activityCount: Number(requirement.activityCount || 0) + 1,
      versionCount: Number(requirement.versionCount || 1) + 1,
      updatedByUid: request.auth.uid,
      updatedByName: actorName,
      updatedAt: createTimestamp()
    });
  });

  await createNotifications([requirement.ownerUid, requirement.createdByUid], {
    type: decision.toLowerCase(),
    title: `${requirementId} ${decision.toLowerCase()}`,
    message: comment || `${actorName} marked the requirement as ${decision}.`,
    requirementId
  });

  return {
    ok: true,
    requirementId,
    decision,
    actorName,
    comment
  };
});
