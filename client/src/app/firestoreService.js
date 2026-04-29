import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

const REQUIREMENTS_COLLECTION = "requirements";
const SYSTEM_COLLECTION = "system";
const PAGE_SIZE = 50;

function ensureDb() {
  if (!db) {
    throw new Error("Firebase is not configured for this environment.");
  }
}

function normalizeArray(values) {
  return Array.isArray(values) ? values.filter(Boolean) : [];
}

function createRelativeTimeLabel(dateLike) {
  if (!dateLike) {
    return "Recently updated";
  }

  const date = dateLike?.toDate ? dateLike.toDate() : new Date(dateLike);
  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function normalizeRequirement(id, data = {}) {
  return {
    id,
    title: data.title || "Untitled Requirement",
    module: data.module || "General",
    priority: data.priority || "Medium",
    status: data.status || "Draft",
    ownerName: data.ownerName || data.owner || "Unassigned",
    ownerUid: data.ownerUid || "",
    sprint: data.sprint || "Backlog",
    progress: Number.isFinite(Number(data.progress)) ? Number(data.progress) : 0,
    description: data.description || "",
    acceptanceCriteria: normalizeArray(data.acceptanceCriteria),
    dependencyIds: normalizeArray(data.dependencyIds || data.dependencies),
    tags: normalizeArray(data.tags),
    commentCount: Number.isFinite(Number(data.commentCount)) ? Number(data.commentCount) : normalizeArray(data.comments).length,
    activityCount: Number.isFinite(Number(data.activityCount)) ? Number(data.activityCount) : normalizeArray(data.activity).length,
    createdByUid: data.createdByUid || "",
    createdByName: data.createdByName || "",
    updatedByUid: data.updatedByUid || "",
    updatedByName: data.updatedByName || "",
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

function normalizeComment(id, data = {}) {
  return {
    id,
    authorName: data.authorName || data.author || "Workspace User",
    authorUid: data.authorUid || "",
    authorRole: data.authorRole || data.role || "user",
    message: data.message || "",
    createdAt: data.createdAt || null,
    time: createRelativeTimeLabel(data.createdAt)
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
    time: createRelativeTimeLabel(data.createdAt)
  };
}

function toRequirementSummary(requirement) {
  return {
    id: requirement.id,
    title: requirement.title,
    module: requirement.module,
    priority: requirement.priority,
    status: requirement.status,
    owner: requirement.ownerName,
    sprint: requirement.sprint,
    progress: requirement.progress,
    description: requirement.description,
    commentCount: requirement.commentCount
  };
}

function countByStatus(requirements, statuses) {
  return statuses.map((status) => ({
    label: status,
    value: requirements.filter((requirement) => requirement.status === status).length
  }));
}

function groupByModule(requirements) {
  const counts = new Map();

  requirements.forEach((requirement) => {
    const key = requirement.module || "General";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count);
}

function averageProgress(requirements) {
  if (requirements.length === 0) {
    return 0;
  }

  return Math.round(requirements.reduce((sum, item) => sum + Number(item.progress || 0), 0) / requirements.length);
}

function buildInsights(requirements) {
  const completed = requirements.filter((requirement) => requirement.status === "Completed").length;
  const blocked = requirements.filter((requirement) => requirement.status === "Blocked").length;
  const critical = requirements.filter((requirement) => requirement.priority === "Critical").length;

  return [
    `${completed} requirement${completed === 1 ? "" : "s"} have been completed so far.`,
    blocked > 0
      ? `${blocked} requirement${blocked === 1 ? "" : "s"} are currently blocked and need immediate attention.`
      : "No requirements are currently blocked.",
    `${critical} critical requirement${critical === 1 ? "" : "s"} still need close delivery tracking.`
  ];
}

function buildTimeline(requirements) {
  return requirements
    .slice()
    .sort((left, right) => Number(right.progress || 0) - Number(left.progress || 0))
    .slice(0, 5)
    .map((requirement) => `${requirement.id} is ${requirement.status.toLowerCase()} at ${requirement.progress}% progress in ${requirement.sprint}.`);
}

function buildBurndownTrend(requirements) {
  const total = Math.max(requirements.length, 1);
  const sorted = requirements.slice().sort((left, right) => Number(right.progress || 0) - Number(left.progress || 0));
  const checkpoints = [0.2, 0.4, 0.6, 0.8, 1];

  return checkpoints.map((checkpoint, index) => {
    const sliceEnd = Math.max(1, Math.ceil(sorted.length * checkpoint));
    const currentSlice = sorted.slice(0, sliceEnd);
    const actualOutstanding = Math.max(0, total - Math.round((averageProgress(currentSlice) / 100) * total));
    const idealOutstanding = Math.max(0, total - Math.round(total * checkpoint));

    return {
      name: `Week ${index + 1}`,
      ideal: idealOutstanding,
      actual: actualOutstanding
    };
  });
}

function buildCollaborationThreads(requirements) {
  return requirements
    .filter((requirement) => requirement.commentCount > 0 || requirement.status === "Blocked" || requirement.status === "In Review")
    .slice()
    .sort((left, right) => right.commentCount - left.commentCount)
    .slice(0, 6)
    .map((requirement) => ({
      id: `thread-${requirement.id}`,
      title: requirement.title,
      tag: requirement.id,
      participants: Math.max(1, requirement.commentCount),
      owner: requirement.ownerName,
      status: requirement.status,
      updatedAt: createRelativeTimeLabel(requirement.updatedAt),
      excerpt: requirement.description || "This requirement is waiting for team discussion."
    }));
}

function buildCollaborationMembers(requirements) {
  const owners = new Map();

  requirements.forEach((requirement) => {
    const owner = requirement.ownerName || "Unassigned";
    owners.set(owner, (owners.get(owner) ?? 0) + 1);
  });

  return [...owners.entries()].map(([name, count]) => ({
    name,
    role: "Contributor",
    focus: `${count} assigned requirement${count === 1 ? "" : "s"}`
  }));
}

function buildActivityFeed(activityItems) {
  return activityItems.slice(0, 10);
}

async function getNextRequirementId() {
  ensureDb();
  const counterRef = doc(db, SYSTEM_COLLECTION, "counters");

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(counterRef);
    const currentValue = snapshot.exists() ? Number(snapshot.data().requirementCounter || 0) : 0;
    const nextValue = currentValue + 1;

    transaction.set(counterRef, { requirementCounter: nextValue, updatedAt: serverTimestamp() }, { merge: true });
    return `REQ-${String(nextValue).padStart(3, "0")}`;
  });
}

async function getRequirementActivity(requirementId) {
  ensureDb();
  const activityQuery = query(
    collection(db, REQUIREMENTS_COLLECTION, requirementId, "activity"),
    orderBy("createdAt", "desc"),
    limit(12)
  );
  const snapshot = await getDocs(activityQuery);
  return snapshot.docs.map((document) => normalizeActivity(document.id, document.data()));
}

async function getRequirementComments(requirementId) {
  ensureDb();
  const commentsQuery = query(
    collection(db, REQUIREMENTS_COLLECTION, requirementId, "comments"),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snapshot = await getDocs(commentsQuery);
  return snapshot.docs.map((document) => normalizeComment(document.id, document.data()));
}

async function listRequirementDocs() {
  ensureDb();
  const requirementsQuery = query(collection(db, REQUIREMENTS_COLLECTION), orderBy("updatedAt", "desc"), limit(PAGE_SIZE));
  const snapshot = await getDocs(requirementsQuery);
  return snapshot.docs.map((document) => normalizeRequirement(document.id, document.data()));
}

export function subscribeRequirements(callback, onError) {
  ensureDb();
  const requirementsQuery = query(collection(db, REQUIREMENTS_COLLECTION), orderBy("updatedAt", "desc"), limit(PAGE_SIZE));

  return onSnapshot(
    requirementsQuery,
    (snapshot) => {
      callback(snapshot.docs.map((document) => toRequirementSummary(normalizeRequirement(document.id, document.data()))));
    },
    onError
  );
}

export async function listRequirements() {
  const requirements = await listRequirementDocs();
  return requirements.map(toRequirementSummary);
}

export async function getRequirementById(requirementId) {
  ensureDb();
  const documentRef = doc(db, REQUIREMENTS_COLLECTION, requirementId);
  const documentSnap = await getDoc(documentRef);

  if (!documentSnap.exists()) {
    return null;
  }

  const requirement = normalizeRequirement(documentSnap.id, documentSnap.data());
  const [comments, activity] = await Promise.all([getRequirementComments(requirementId), getRequirementActivity(requirementId)]);

  return {
    ...requirement,
    comments: comments.length > 0 ? comments : normalizeArray(documentSnap.data().comments).map((item, index) => normalizeComment(`legacy-comment-${index}`, item)),
    activity: activity.length > 0 ? activity : normalizeArray(documentSnap.data().activity).map((item, index) => normalizeActivity(`legacy-activity-${index}`, item)),
    dependencies: requirement.dependencyIds
  };
}

export async function createRequirementRecord(data) {
  ensureDb();
  const id = await getNextRequirementId();
  const requirementRef = doc(db, REQUIREMENTS_COLLECTION, id);
  const activityRef = collection(db, REQUIREMENTS_COLLECTION, id, "activity");
  const ownerName = data.ownerName || data.owner || "Unassigned";
  const ownerUid = data.ownerUid || "";
  const createdByName = data.createdByName || ownerName;
  const createdByUid = data.createdByUid || ownerUid;

  await runTransaction(db, async (transaction) => {
    transaction.set(requirementRef, {
      title: data.title || "Untitled Requirement",
      module: data.module || "General",
      priority: data.priority || "Medium",
      status: "Draft",
      ownerName,
      ownerUid,
      sprint: data.sprint || "Backlog",
      progress: 0,
      description: data.description || "",
      acceptanceCriteria: normalizeArray(data.acceptanceCriteria),
      dependencyIds: normalizeArray(data.dependencyIds || data.dependencies),
      tags: normalizeArray(data.tags),
      commentCount: 0,
      activityCount: 1,
      createdByUid,
      createdByName,
      updatedByUid: createdByUid,
      updatedByName: createdByName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const initialActivityRef = doc(activityRef);
    transaction.set(initialActivityRef, {
      type: "created",
      text: "Requirement created from the workbench.",
      actorName: createdByName,
      actorUid: createdByUid,
      createdAt: serverTimestamp()
    });
  });

  return getRequirementById(id);
}

export async function updateRequirementRecord(requirementId, data) {
  ensureDb();
  const requirementRef = doc(db, REQUIREMENTS_COLLECTION, requirementId);
  const activityRef = collection(db, REQUIREMENTS_COLLECTION, requirementId, "activity");
  const requirementSnapshot = await getDoc(requirementRef);

  if (!requirementSnapshot.exists()) {
    throw new Error("Requirement not found.");
  }

  const currentRequirement = normalizeRequirement(requirementSnapshot.id, requirementSnapshot.data());
  const updates = {
    title: data.title || currentRequirement.title,
    module: data.module || currentRequirement.module,
    priority: data.priority || currentRequirement.priority,
    status: data.status || currentRequirement.status,
    ownerName: data.ownerName || data.owner || currentRequirement.ownerName,
    ownerUid: data.ownerUid || currentRequirement.ownerUid,
    sprint: data.sprint || currentRequirement.sprint,
    progress: Number.isFinite(Number(data.progress)) ? Number(data.progress) : currentRequirement.progress,
    description: data.description || currentRequirement.description,
    acceptanceCriteria: normalizeArray(data.acceptanceCriteria).length > 0 ? normalizeArray(data.acceptanceCriteria) : currentRequirement.acceptanceCriteria,
    dependencyIds: normalizeArray(data.dependencyIds || data.dependencies).length > 0
      ? normalizeArray(data.dependencyIds || data.dependencies)
      : currentRequirement.dependencyIds,
    tags: normalizeArray(data.tags).length > 0 ? normalizeArray(data.tags) : currentRequirement.tags,
    updatedByUid: data.updatedByUid || currentRequirement.updatedByUid,
    updatedByName: data.updatedByName || currentRequirement.updatedByName,
    updatedAt: serverTimestamp()
  };

  await runTransaction(db, async (transaction) => {
    transaction.update(requirementRef, updates);
    transaction.set(doc(activityRef), {
      type: "updated",
      text: "Requirement details were updated.",
      actorName: updates.updatedByName,
      actorUid: updates.updatedByUid,
      createdAt: serverTimestamp()
    });
    transaction.update(requirementRef, {
      activityCount: currentRequirement.activityCount + 1
    });
  });

  return getRequirementById(requirementId);
}

export async function deleteRequirementRecord(requirementId) {
  ensureDb();
  await deleteDoc(doc(db, REQUIREMENTS_COLLECTION, requirementId));
}

export async function createRequirementCommentRecord(requirementId, data) {
  ensureDb();
  const requirementRef = doc(db, REQUIREMENTS_COLLECTION, requirementId);
  const commentsRef = collection(db, REQUIREMENTS_COLLECTION, requirementId, "comments");
  const activityRef = collection(db, REQUIREMENTS_COLLECTION, requirementId, "activity");
  const requirementSnapshot = await getDoc(requirementRef);

  if (!requirementSnapshot.exists()) {
    throw new Error("Requirement not found.");
  }

  const requirement = normalizeRequirement(requirementSnapshot.id, requirementSnapshot.data());
  const commentData = {
    authorName: data.authorName || data.author || "Workspace User",
    authorUid: data.authorUid || "",
    authorRole: data.authorRole || data.role || "user",
    message: data.message || "",
    createdAt: serverTimestamp()
  };

  const commentId = await runTransaction(db, async (transaction) => {
    const newCommentRef = doc(commentsRef);
    const newActivityRef = doc(activityRef);

    transaction.set(newCommentRef, commentData);
    transaction.set(newActivityRef, {
      type: "comment",
      text: `${commentData.authorName} added a new discussion comment.`,
      actorName: commentData.authorName,
      actorUid: commentData.authorUid,
      createdAt: serverTimestamp()
    });
    transaction.update(requirementRef, {
      commentCount: requirement.commentCount + 1,
      activityCount: requirement.activityCount + 1,
      updatedAt: serverTimestamp(),
      updatedByUid: commentData.authorUid,
      updatedByName: commentData.authorName
    });

    return newCommentRef.id;
  });

  const savedComment = await getDoc(doc(db, REQUIREMENTS_COLLECTION, requirementId, "comments", commentId));
  return normalizeComment(savedComment.id, savedComment.data());
}

export async function getDashboardMetrics() {
  const requirements = await listRequirementDocs();
  const completionRate = averageProgress(requirements);
  const completedCount = requirements.filter((requirement) => requirement.status === "Completed").length;
  const blockedCount = requirements.filter((requirement) => requirement.status === "Blocked").length;
  const inReviewCount = requirements.filter((requirement) => requirement.status === "In Review").length;

  return {
    summary: {
      productName: "REMT",
      activeSprint: "Sprint 7",
      completionRate,
      ambiguityAlerts: blockedCount + inReviewCount,
      stakeholderSatisfaction: Math.max(82, 100 - blockedCount * 4)
    },
    kpis: [
      {
        label: "Total Requirements",
        value: String(requirements.length),
        delta: `${requirements.filter((requirement) => requirement.status !== "Completed").length} still active`,
        icon: "RF"
      },
      {
        label: "Completion Rate",
        value: `${completionRate}%`,
        delta: `${completedCount} completed items`,
        icon: "CP"
      },
      {
        label: "Blocked Items",
        value: String(blockedCount),
        delta: blockedCount > 0 ? "Needs team attention" : "No blockers right now",
        icon: "BL"
      },
      {
        label: "In Review",
        value: String(inReviewCount),
        delta: "Awaiting approval and sign-off",
        icon: "RV"
      }
    ],
    timeline: buildTimeline(requirements),
    insights: buildInsights(requirements),
    featuredRequirements: requirements
      .slice()
      .sort((left, right) => {
        const priorityWeight = { Critical: 3, High: 2, Medium: 1, Low: 0 };
        return (priorityWeight[right.priority] ?? 0) - (priorityWeight[left.priority] ?? 0);
      })
      .slice(0, 4)
      .map(toRequirementSummary)
  };
}

export async function getAnalyticsMetrics() {
  const requirements = await listRequirementDocs();

  return {
    cards: countByStatus(requirements, ["Draft", "In Progress", "In Review", "Completed"]),
    trend: buildBurndownTrend(requirements),
    distribution: groupByModule(requirements)
  };
}

export async function getCollaborationMetrics() {
  const requirements = await listRequirementDocs();
  const activityCollections = await Promise.all(
    requirements.slice(0, 10).map(async (requirement) => {
      const items = await getRequirementActivity(requirement.id);
      return items.map((item) => ({
        ...item,
        requirementId: requirement.id
      }));
    })
  );

  return {
    threads: buildCollaborationThreads(requirements),
    members: buildCollaborationMembers(requirements),
    activity: buildActivityFeed(activityCollections.flat())
  };
}
