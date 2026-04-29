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
  updateDoc,
  where
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "./firebase";
import { analyzeRequirementDraft, summarizeRequirementPortfolio } from "./smartAnalysis";

const REQUIREMENTS_COLLECTION = "requirements";
const SYSTEM_COLLECTION = "system";
const NOTIFICATIONS_COLLECTION = "notifications";
const PAGE_SIZE = 50;

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

function normalizeApproval(item = {}, index = 0) {
  return {
    id: item.id || `approval-${index}`,
    decision: item.decision || "Pending",
    actorName: item.actorName || "Workspace User",
    actorUid: item.actorUid || "",
    actorRole: item.actorRole || "stakeholder",
    comment: item.comment || "",
    createdAt: item.createdAt || null,
    time: createRelativeTimeLabel(item.createdAt)
  };
}

function normalizeAnalysis(data = {}) {
  return {
    typeSuggestion: data.typeSuggestion || "",
    prioritySuggestion: data.prioritySuggestion || "",
    summary: data.summary || "",
    rewrittenRequirement: data.rewrittenRequirement || "",
    clarity: {
      isClear: Boolean(data.clarity?.isClear),
      vagueTerms: normalizeArray(data.clarity?.vagueTerms),
      suggestions: normalizeArray(data.clarity?.suggestions)
    },
    duplicateCandidates: normalizeArray(data.duplicateCandidates),
    conflictCandidates: normalizeArray(data.conflictCandidates)
  };
}

function normalizeVersion(id, data = {}) {
  return {
    id,
    title: data.title || "Requirement snapshot",
    status: data.status || "Pending",
    priority: data.priority || "Medium",
    editorName: data.editorName || "Workspace User",
    editorUid: data.editorUid || "",
    changeNote: data.changeNote || "Requirement updated.",
    createdAt: data.createdAt || null,
    time: createRelativeTimeLabel(data.createdAt)
  };
}

function normalizeNotification(id, data = {}) {
  return {
    id,
    type: data.type || "update",
    title: data.title || "Requirement update",
    message: data.message || "",
    requirementId: data.requirementId || "",
    recipientUid: data.recipientUid || "",
    read: Boolean(data.read),
    createdAt: data.createdAt || null,
    time: createRelativeTimeLabel(data.createdAt)
  };
}

function normalizeRequirement(id, data = {}) {
  const analysis = normalizeAnalysis(data.analysis);

  return {
    id,
    title: data.title || "Untitled Requirement",
    description: data.description || "",
    type: data.type || analysis.typeSuggestion || "Functional",
    priority: data.priority || analysis.prioritySuggestion || "Medium",
    status: data.status || "Pending",
    stakeholder: data.stakeholder || data.ownerName || data.owner || "Unassigned",
    stakeholderUid: data.stakeholderUid || data.ownerUid || "",
    ownerName: data.ownerName || data.owner || data.stakeholder || "Unassigned",
    ownerUid: data.ownerUid || data.stakeholderUid || "",
    project: data.project || "Core Platform",
    module: data.module || "General",
    sprint: data.sprint || "Backlog",
    progress: Number.isFinite(Number(data.progress)) ? Number(data.progress) : 0,
    acceptanceCriteria: normalizeArray(data.acceptanceCriteria),
    dependencyIds: normalizeArray(data.dependencyIds || data.dependencies),
    tags: normalizeArray(data.tags),
    approvals: normalizeArray(data.approvals).map(normalizeApproval),
    analysis,
    commentCount: Number.isFinite(Number(data.commentCount)) ? Number(data.commentCount) : 0,
    activityCount: Number.isFinite(Number(data.activityCount)) ? Number(data.activityCount) : 0,
    versionCount: Number.isFinite(Number(data.versionCount)) ? Number(data.versionCount) : 1,
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
    authorRole: data.authorRole || data.role || "stakeholder",
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
    description: requirement.description,
    type: requirement.type,
    priority: requirement.priority,
    status: requirement.status,
    stakeholder: requirement.stakeholder,
    owner: requirement.ownerName,
    project: requirement.project,
    module: requirement.module,
    sprint: requirement.sprint,
    progress: requirement.progress,
    commentCount: requirement.commentCount,
    versionCount: requirement.versionCount,
    createdAt: requirement.createdAt,
    updatedAt: requirement.updatedAt,
    analysis: requirement.analysis
  };
}

function priorityWeight(priority) {
  return { High: 3, Medium: 2, Low: 1 }[priority] ?? 0;
}

function averageProgress(requirements) {
  if (requirements.length === 0) {
    return 0;
  }

  return Math.round(requirements.reduce((sum, item) => sum + Number(item.progress || 0), 0) / requirements.length);
}

function countByStatus(requirements, statuses) {
  return statuses.map((status) => ({
    label: status,
    value: requirements.filter((requirement) => requirement.status === status).length
  }));
}

function groupByField(requirements, field) {
  const counts = new Map();

  requirements.forEach((requirement) => {
    const key = requirement[field] || "Unassigned";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count);
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

function buildInsights(requirements) {
  const approved = requirements.filter((requirement) => requirement.status === "Approved").length;
  const pending = requirements.filter((requirement) => requirement.status === "Pending").length;
  const vague = requirements.filter((requirement) => !requirement.analysis.clarity.isClear).length;
  const duplicates = requirements.filter((requirement) => requirement.analysis.duplicateCandidates.length > 0).length;

  return [
    `${approved} requirement${approved === 1 ? "" : "s"} have already been approved.`,
    pending > 0 ? `${pending} requirement${pending === 1 ? "" : "s"} are still waiting for workflow decisions.` : "No requirements are waiting for approval.",
    vague > 0 ? `${vague} requirement${vague === 1 ? "" : "s"} contain clarity warnings that should be refined.` : "No ambiguity alerts were detected in the current set.",
    duplicates > 0 ? `${duplicates} requirement${duplicates === 1 ? "" : "s"} look similar to existing records and need duplicate review.` : "No obvious duplicates were detected."
  ];
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
  const activityQuery = query(collection(db, REQUIREMENTS_COLLECTION, requirementId, "activity"), orderBy("createdAt", "desc"), limit(20));
  const snapshot = await getDocs(activityQuery);
  return snapshot.docs.map((document) => normalizeActivity(document.id, document.data()));
}

async function getRequirementComments(requirementId) {
  ensureDb();
  const commentsQuery = query(collection(db, REQUIREMENTS_COLLECTION, requirementId, "comments"), orderBy("createdAt", "desc"), limit(20));
  const snapshot = await getDocs(commentsQuery);
  return snapshot.docs.map((document) => normalizeComment(document.id, document.data()));
}

async function getRequirementVersions(requirementId) {
  ensureDb();
  const versionsQuery = query(collection(db, REQUIREMENTS_COLLECTION, requirementId, "versions"), orderBy("createdAt", "desc"), limit(15));
  const snapshot = await getDocs(versionsQuery);
  return snapshot.docs.map((document) => normalizeVersion(document.id, document.data()));
}

async function listRequirementDocs() {
  ensureDb();
  const requirementsQuery = query(collection(db, REQUIREMENTS_COLLECTION), orderBy("updatedAt", "desc"), limit(PAGE_SIZE));
  const snapshot = await getDocs(requirementsQuery);
  return snapshot.docs.map((document) => normalizeRequirement(document.id, document.data()));
}

function buildVersionSnapshot(requirement, editorName, editorUid, changeNote) {
  return {
    title: requirement.title,
    description: requirement.description,
    type: requirement.type,
    priority: requirement.priority,
    status: requirement.status,
    stakeholder: requirement.stakeholder,
    project: requirement.project,
    module: requirement.module,
    editorName,
    editorUid,
    changeNote,
    createdAt: serverTimestamp()
  };
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

export function subscribeNotifications(uid, callback, onError) {
  ensureDb();
  if (!uid) {
    callback([]);
    return () => {};
  }

  const notificationsQuery = query(
    collection(db, NOTIFICATIONS_COLLECTION),
    where("recipientUid", "==", uid),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      callback(snapshot.docs.map((document) => normalizeNotification(document.id, document.data())));
    },
    onError
  );
}

export async function markNotificationRead(notificationId) {
  ensureDb();
  await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
    read: true
  });
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
  const [comments, activity, versions] = await Promise.all([
    getRequirementComments(requirementId),
    getRequirementActivity(requirementId),
    getRequirementVersions(requirementId)
  ]);

  return {
    ...requirement,
    comments,
    activity,
    versions,
    dependencies: requirement.dependencyIds
  };
}

export async function previewRequirementAnalysis(data) {
  const requirements = await listRequirementDocs();
  return analyzeRequirementDraft(data, requirements);
}

export async function createRequirementRecord(data) {
  ensureDb();
  const id = await getNextRequirementId();
  const existingRequirements = await listRequirementDocs();
  const analysis = analyzeRequirementDraft(
    {
      id,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority
    },
    existingRequirements
  );
  const requirementRef = doc(db, REQUIREMENTS_COLLECTION, id);
  const activityRef = collection(db, REQUIREMENTS_COLLECTION, id, "activity");
  const versionsRef = collection(db, REQUIREMENTS_COLLECTION, id, "versions");
  const ownerName = data.ownerName || data.owner || data.stakeholder || "Unassigned";
  const ownerUid = data.ownerUid || data.stakeholderUid || "";
  const createdByName = data.createdByName || ownerName;
  const createdByUid = data.createdByUid || ownerUid;

  await runTransaction(db, async (transaction) => {
    transaction.set(requirementRef, {
      title: data.title || "Untitled Requirement",
      description: data.description || "",
      type: data.type || analysis.typeSuggestion,
      priority: data.priority || analysis.prioritySuggestion,
      status: data.status || "Pending",
      stakeholder: data.stakeholder || ownerName,
      stakeholderUid: data.stakeholderUid || ownerUid,
      ownerName,
      ownerUid,
      project: data.project || "Core Platform",
      module: data.module || "General",
      sprint: data.sprint || "Backlog",
      progress: Number.isFinite(Number(data.progress)) ? Number(data.progress) : 0,
      acceptanceCriteria: normalizeArray(data.acceptanceCriteria),
      dependencyIds: normalizeArray(data.dependencyIds || data.dependencies),
      tags: normalizeArray(data.tags),
      approvals: [],
      analysis,
      commentCount: 0,
      activityCount: 1,
      versionCount: 1,
      createdByUid,
      createdByName,
      updatedByUid: createdByUid,
      updatedByName: createdByName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    transaction.set(doc(activityRef), {
      type: "created",
      text: "Requirement created and submitted for review.",
      actorName: createdByName,
      actorUid: createdByUid,
      createdAt: serverTimestamp()
    });

    transaction.set(doc(versionsRef), {
      title: data.title || "Untitled Requirement",
      description: data.description || "",
      type: data.type || analysis.typeSuggestion,
      priority: data.priority || analysis.prioritySuggestion,
      status: data.status || "Pending",
      stakeholder: data.stakeholder || ownerName,
      project: data.project || "Core Platform",
      module: data.module || "General",
      editorName: createdByName,
      editorUid: createdByUid,
      changeNote: "Initial requirement version.",
      createdAt: serverTimestamp()
    });
  });

  return getRequirementById(id);
}

export async function updateRequirementRecord(requirementId, data) {
  ensureDb();
  const requirementRef = doc(db, REQUIREMENTS_COLLECTION, requirementId);
  const versionsRef = collection(db, REQUIREMENTS_COLLECTION, requirementId, "versions");
  const activityRef = collection(db, REQUIREMENTS_COLLECTION, requirementId, "activity");
  const requirementSnapshot = await getDoc(requirementRef);

  if (!requirementSnapshot.exists()) {
    throw new Error("Requirement not found.");
  }

  const currentRequirement = normalizeRequirement(requirementSnapshot.id, requirementSnapshot.data());
  const analysis = analyzeRequirementDraft(
    {
      id: requirementId,
      title: data.title || currentRequirement.title,
      description: data.description || currentRequirement.description,
      type: data.type || currentRequirement.type,
      priority: data.priority || currentRequirement.priority
    },
    (await listRequirementDocs()).filter((item) => item.id !== requirementId)
  );

  const updates = {
    title: data.title || currentRequirement.title,
    description: data.description || currentRequirement.description,
    type: data.type || currentRequirement.type,
    priority: data.priority || currentRequirement.priority,
    status: data.status || currentRequirement.status,
    stakeholder: data.stakeholder || currentRequirement.stakeholder,
    stakeholderUid: data.stakeholderUid || currentRequirement.stakeholderUid,
    ownerName: data.ownerName || data.owner || currentRequirement.ownerName,
    ownerUid: data.ownerUid || currentRequirement.ownerUid,
    project: data.project || currentRequirement.project,
    module: data.module || currentRequirement.module,
    sprint: data.sprint || currentRequirement.sprint,
    progress: Number.isFinite(Number(data.progress)) ? Number(data.progress) : currentRequirement.progress,
    acceptanceCriteria: Array.isArray(data.acceptanceCriteria) ? normalizeArray(data.acceptanceCriteria) : currentRequirement.acceptanceCriteria,
    dependencyIds: Array.isArray(data.dependencyIds || data.dependencies)
      ? normalizeArray(data.dependencyIds || data.dependencies)
      : currentRequirement.dependencyIds,
    tags: Array.isArray(data.tags) ? normalizeArray(data.tags) : currentRequirement.tags,
    analysis,
    updatedByUid: data.updatedByUid || currentRequirement.updatedByUid,
    updatedByName: data.updatedByName || currentRequirement.updatedByName || "Workspace User",
    updatedAt: serverTimestamp()
  };

  await runTransaction(db, async (transaction) => {
    transaction.set(doc(versionsRef), buildVersionSnapshot(currentRequirement, updates.updatedByName, updates.updatedByUid, "Saved previous version before update."));
    transaction.update(requirementRef, {
      ...updates,
      versionCount: currentRequirement.versionCount + 1,
      activityCount: currentRequirement.activityCount + 1
    });
    transaction.set(doc(activityRef), {
      type: "updated",
      text: "Requirement details were updated.",
      actorName: updates.updatedByName,
      actorUid: updates.updatedByUid,
      createdAt: serverTimestamp()
    });
  });

  return getRequirementById(requirementId);
}

export async function deleteRequirementRecord(requirementId) {
  ensureDb();
  await deleteDoc(doc(db, REQUIREMENTS_COLLECTION, requirementId));
}

export async function createRequirementCommentRecord(requirementId, data) {
  ensureFunctions();
  const addComment = httpsCallable(functions, "addRequirementComment");
  const result = await addComment({ requirementId, ...data });
  return result.data;
}

export async function reviewRequirementRecord(requirementId, data) {
  ensureFunctions();
  const reviewRequirement = httpsCallable(functions, "reviewRequirement");
  const result = await reviewRequirement({ requirementId, ...data });
  return result.data;
}

export async function getDashboardMetrics() {
  const requirements = await listRequirementDocs();
  const pendingCount = requirements.filter((requirement) => requirement.status === "Pending").length;
  const approvedCount = requirements.filter((requirement) => requirement.status === "Approved").length;
  const rejectedCount = requirements.filter((requirement) => requirement.status === "Rejected").length;
  const inProgressCount = requirements.filter((requirement) => requirement.status === "In Progress").length;
  const highPriorityCount = requirements.filter((requirement) => requirement.priority === "High").length;
  const qualityAlerts = requirements.filter((requirement) => !requirement.analysis.clarity.isClear).length;

  return {
    summary: {
      productName: "REMT",
      activeSprint: "Sprint 7",
      completionRate: averageProgress(requirements),
      ambiguityAlerts: qualityAlerts,
      stakeholderSatisfaction: Math.max(80, 100 - rejectedCount * 5),
      portfolioSummary: summarizeRequirementPortfolio(requirements)
    },
    kpis: [
      { label: "Total Requirements", value: String(requirements.length), delta: `${pendingCount} waiting review`, icon: "TR" },
      { label: "Approved", value: String(approvedCount), delta: `${rejectedCount} rejected`, icon: "AP" },
      { label: "In Progress", value: String(inProgressCount), delta: `${highPriorityCount} high priority`, icon: "IP" },
      { label: "Clarity Alerts", value: String(qualityAlerts), delta: qualityAlerts > 0 ? "Needs rewrite attention" : "No major ambiguity", icon: "AI" }
    ],
    timeline: requirements
      .slice()
      .sort((left, right) => priorityWeight(right.priority) - priorityWeight(left.priority))
      .slice(0, 5)
      .map((requirement) => `${requirement.id} is ${requirement.status.toLowerCase()} in ${requirement.project}/${requirement.module}.`),
    insights: buildInsights(requirements),
    featuredRequirements: requirements
      .slice()
      .sort((left, right) => priorityWeight(right.priority) - priorityWeight(left.priority))
      .slice(0, 4)
      .map(toRequirementSummary)
  };
}

export async function getAnalyticsMetrics() {
  const requirements = await listRequirementDocs();

  return {
    cards: countByStatus(requirements, ["Pending", "Approved", "Rejected", "In Progress"]),
    trend: buildBurndownTrend(requirements),
    distribution: groupByField(requirements, "project"),
    typeDistribution: groupByField(requirements, "type"),
    priorityDistribution: groupByField(requirements, "priority")
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
    threads: requirements
      .filter((requirement) => requirement.commentCount > 0 || requirement.status === "Pending" || requirement.status === "Rejected")
      .slice(0, 6)
      .map((requirement) => ({
        id: `thread-${requirement.id}`,
        title: requirement.title,
        tag: requirement.id,
        participants: Math.max(1, requirement.commentCount + requirement.approvals.length),
        owner: requirement.stakeholder,
        status: requirement.status,
        updatedAt: createRelativeTimeLabel(requirement.updatedAt),
        excerpt: requirement.analysis.summary || requirement.description
      })),
    members: groupByField(requirements, "stakeholder").map((item) => ({
      name: item.name,
      role: "Contributor",
      focus: `${item.count} assigned requirement${item.count === 1 ? "" : "s"}`
    })),
    activity: activityCollections.flat().sort((left, right) => {
      const leftTime = left.createdAt?.toDate ? left.createdAt.toDate().getTime() : new Date(left.createdAt || 0).getTime();
      const rightTime = right.createdAt?.toDate ? right.createdAt.toDate().getTime() : new Date(right.createdAt || 0).getTime();
      return rightTime - leftTime;
    }).slice(0, 10)
  };
}
