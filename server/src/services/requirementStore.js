import { getFirestoreDb } from "../config/firebase.js";

const REQUIREMENTS_COLLECTION = "requirements";

function normalizeArray(values) {
  return Array.isArray(values) ? values.filter(Boolean) : [];
}

function normalizeRequirement(id, data = {}) {
  return {
    id,
    title: data.title || "Untitled Requirement",
    module: data.module || "General",
    priority: data.priority || "Medium",
    status: data.status || "Draft",
    owner: data.ownerName || data.owner || "Unassigned",
    ownerName: data.ownerName || data.owner || "Unassigned",
    ownerUid: data.ownerUid || "",
    sprint: data.sprint || "Backlog",
    progress: Number.isFinite(Number(data.progress)) ? Number(data.progress) : 0,
    description: data.description || "",
    acceptanceCriteria: normalizeArray(data.acceptanceCriteria),
    dependencies: normalizeArray(data.dependencyIds || data.dependencies),
    dependencyIds: normalizeArray(data.dependencyIds || data.dependencies),
    commentCount: Number.isFinite(Number(data.commentCount)) ? Number(data.commentCount) : normalizeArray(data.comments).length,
    activityCount: Number.isFinite(Number(data.activityCount)) ? Number(data.activityCount) : normalizeArray(data.activity).length,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

function normalizeComment(id, data = {}) {
  return {
    id,
    author: data.authorName || data.author || "Workspace User",
    authorName: data.authorName || data.author || "Workspace User",
    authorUid: data.authorUid || "",
    role: data.authorRole || data.role || "user",
    authorRole: data.authorRole || data.role || "user",
    message: data.message || "",
    createdAt: data.createdAt || null,
    time: "Recently updated"
  };
}

function normalizeActivity(id, data = {}) {
  return {
    id,
    type: data.type || "update",
    text: data.text || "Requirement updated.",
    actorName: data.actorName || "",
    actorUid: data.actorUid || "",
    createdAt: data.createdAt || null,
    time: "Recently updated"
  };
}

async function getCollection() {
  return getFirestoreDb().collection(REQUIREMENTS_COLLECTION);
}

async function listRequirementsFromFirestore(collection) {
  const snapshot = await collection.orderBy("updatedAt", "desc").get();
  return snapshot.docs.map((document) => normalizeRequirement(document.id, document.data()));
}

async function getRequirementComments(documentRef) {
  const snapshot = await documentRef.collection("comments").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((document) => normalizeComment(document.id, document.data()));
}

async function getRequirementActivity(documentRef) {
  const snapshot = await documentRef.collection("activity").orderBy("createdAt", "desc").get();
  return snapshot.docs.map((document) => normalizeActivity(document.id, document.data()));
}

function toRequirementSummary(requirement) {
  return {
    id: requirement.id,
    title: requirement.title,
    status: requirement.status,
    priority: requirement.priority,
    module: requirement.module,
    owner: requirement.ownerName,
    sprint: requirement.sprint,
    progress: requirement.progress,
    description: requirement.description
  };
}

export async function listRequirements() {
  const collection = await getCollection();
  const firestoreRequirements = await listRequirementsFromFirestore(collection);
  return firestoreRequirements.map(toRequirementSummary);
}

export async function getRequirementById(id) {
  const collection = await getCollection();
  const document = await collection.doc(id).get();

  if (!document.exists) {
    return null;
  }

  const [comments, activity] = await Promise.all([getRequirementComments(document.ref), getRequirementActivity(document.ref)]);

  return {
    ...normalizeRequirement(document.id, document.data()),
    comments,
    activity
  };
}

export async function createRequirement(input) {
  const collection = await getCollection();
  const existingRequirements = await listRequirementsFromFirestore(collection);
  const nextId = `REQ-${String(existingRequirements.length + 1).padStart(3, "0")}`;
  const newRequirement = {
    title: input.title || "Untitled Requirement",
    module: input.module || "General",
    priority: input.priority || "Medium",
    status: "Draft",
    ownerName: input.ownerName || input.owner || "Unassigned",
    ownerUid: input.ownerUid || "",
    sprint: input.sprint || "Backlog",
    progress: 0,
    description: input.description || "",
    acceptanceCriteria: normalizeArray(input.acceptanceCriteria),
    dependencyIds: normalizeArray(input.dependencyIds || input.dependencies),
    tags: normalizeArray(input.tags),
    commentCount: 0,
    activityCount: 1,
    createdByUid: input.createdByUid || "",
    createdByName: input.createdByName || input.ownerName || input.owner || "Unassigned",
    updatedByUid: input.createdByUid || "",
    updatedByName: input.createdByName || input.ownerName || input.owner || "Unassigned",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await collection.doc(nextId).set(newRequirement);
  await collection.doc(nextId).collection("activity").add({
    type: "created",
    text: "Requirement created from the workbench.",
    actorName: newRequirement.createdByName,
    actorUid: newRequirement.createdByUid,
    createdAt: new Date().toISOString()
  });

  return {
    ...normalizeRequirement(nextId, newRequirement),
    comments: [],
    activity: [
      {
        id: `activity-${Date.now()}`,
        type: "created",
        text: "Requirement created from the workbench.",
        actorName: newRequirement.createdByName,
        actorUid: newRequirement.createdByUid,
        time: "Recently updated"
      }
    ]
  };
}

export async function addRequirementComment(id, input) {
  const collection = await getCollection();
  const document = await collection.doc(id).get();

  if (!document.exists) {
    return null;
  }

  const requirement = normalizeRequirement(document.id, document.data());
  const comment = {
    authorName: input.authorName || input.author || "Workspace User",
    authorUid: input.authorUid || "",
    authorRole: input.authorRole || input.role || "user",
    message: input.message || "",
    createdAt: new Date().toISOString()
  };

  await document.ref.collection("comments").add(comment);
  await document.ref.collection("activity").add({
    type: "comment",
    text: `${comment.authorName} added a new discussion comment.`,
    actorName: comment.authorName,
    actorUid: comment.authorUid,
    createdAt: new Date().toISOString()
  });
  await document.ref.set(
    {
      commentCount: requirement.commentCount + 1,
      activityCount: requirement.activityCount + 1,
      updatedAt: new Date().toISOString(),
      updatedByUid: comment.authorUid,
      updatedByName: comment.authorName
    },
    { merge: true }
  );

  return normalizeComment(`comment-${Date.now()}`, comment);
}

export async function updateRequirement(id, input) {
  const collection = await getCollection();
  const document = await collection.doc(id).get();

  if (!document.exists) {
    return null;
  }

  const existingRequirement = normalizeRequirement(document.id, document.data());
  const updatedRequirement = {
    title: input.title || existingRequirement.title,
    module: input.module || existingRequirement.module,
    priority: input.priority || existingRequirement.priority,
    status: input.status || existingRequirement.status,
    ownerName: input.ownerName || input.owner || existingRequirement.ownerName,
    ownerUid: input.ownerUid || existingRequirement.ownerUid,
    sprint: input.sprint || existingRequirement.sprint,
    progress: Number.isFinite(Number(input.progress)) ? Number(input.progress) : existingRequirement.progress,
    description: input.description || existingRequirement.description,
    acceptanceCriteria: Array.isArray(input.acceptanceCriteria)
      ? input.acceptanceCriteria.filter(Boolean)
      : existingRequirement.acceptanceCriteria,
    dependencyIds: Array.isArray(input.dependencyIds || input.dependencies)
      ? (input.dependencyIds || input.dependencies).filter(Boolean)
      : existingRequirement.dependencyIds,
    updatedByUid: input.updatedByUid || existingRequirement.updatedByUid || "",
    updatedByName: input.updatedByName || existingRequirement.updatedByName || existingRequirement.ownerName,
    updatedAt: new Date().toISOString()
  };

  await document.ref.set(updatedRequirement, { merge: true });

  return {
    ...existingRequirement,
    ...updatedRequirement
  };
}

export async function deleteRequirement(id) {
  const collection = await getCollection();
  const document = await collection.doc(id).get();

  if (!document.exists) {
    return false;
  }

  const [comments, activity] = await Promise.all([document.ref.collection("comments").get(), document.ref.collection("activity").get()]);
  const batch = getFirestoreDb().batch();

  comments.docs.forEach((comment) => batch.delete(comment.ref));
  activity.docs.forEach((entry) => batch.delete(entry.ref));
  batch.delete(document.ref);
  await batch.commit();

  return true;
}
