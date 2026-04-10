import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

const REQUIREMENTS_COLLECTION = "requirements";

function ensureDb() {
  if (!db) {
    throw new Error("Firebase database is not configured for this environment.");
  }
}

function createRelativeTimeLabel() {
  return "Just now";
}

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
    owner: data.owner || "Unassigned",
    sprint: data.sprint || "Backlog",
    progress: Number.isFinite(Number(data.progress)) ? Number(data.progress) : 0,
    description: data.description || "",
    acceptanceCriteria: normalizeArray(data.acceptanceCriteria),
    dependencies: normalizeArray(data.dependencies),
    comments: normalizeArray(data.comments),
    activity: normalizeArray(data.activity),
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null
  };
}

function toRequirementSummary(requirement) {
  return {
    id: requirement.id,
    title: requirement.title,
    module: requirement.module,
    priority: requirement.priority,
    status: requirement.status,
    owner: requirement.owner,
    sprint: requirement.sprint,
    progress: requirement.progress,
    description: requirement.description
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
    .filter((requirement) => (requirement.comments?.length ?? 0) > 0 || requirement.status === "Blocked" || requirement.status === "In Review")
    .slice()
    .sort((left, right) => (right.comments?.length ?? 0) - (left.comments?.length ?? 0))
    .slice(0, 6)
    .map((requirement) => ({
      id: `thread-${requirement.id}`,
      title: requirement.title,
      tag: requirement.id,
      participants: new Set((requirement.comments ?? []).map((comment) => comment.author)).size || 1,
      owner: requirement.owner,
      status: requirement.status,
      updatedAt: requirement.comments?.[0]?.time || requirement.activity?.[0]?.time || "Recently updated",
      excerpt:
        requirement.comments?.[0]?.message ||
        requirement.activity?.[0]?.text ||
        requirement.description ||
        "This requirement is waiting for team discussion."
    }));
}

function buildCollaborationMembers(requirements) {
  const owners = new Map();

  requirements.forEach((requirement) => {
    const owner = requirement.owner || "Unassigned";
    owners.set(owner, (owners.get(owner) ?? 0) + 1);
  });

  return [...owners.entries()].map(([name, count]) => ({
    name,
    role: "Contributor",
    focus: `${count} assigned requirement${count === 1 ? "" : "s"}`
  }));
}

function buildActivityFeed(requirements) {
  return requirements
    .flatMap((requirement) => (requirement.activity ?? []).map((item) => ({ ...item, requirementId: requirement.id })))
    .slice(0, 10);
}

async function listRequirementDocs() {
  ensureDb();
  const requirementsQuery = query(collection(db, REQUIREMENTS_COLLECTION), orderBy("updatedAt", "desc"));
  const snapshot = await getDocs(requirementsQuery);

  return snapshot.docs.map((document) => normalizeRequirement(document.id, document.data()));
}

async function getNextRequirementId() {
  const requirements = await listRequirementDocs();
  return `REQ-${String(requirements.length + 1).padStart(3, "0")}`;
}

export function subscribeRequirements(callback, onError) {
  ensureDb();
  const requirementsQuery = query(collection(db, REQUIREMENTS_COLLECTION), orderBy("updatedAt", "desc"));

  return onSnapshot(
    requirementsQuery,
    (snapshot) => {
      callback(snapshot.docs.map((document) => normalizeRequirement(document.id, document.data())));
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

  return normalizeRequirement(documentSnap.id, documentSnap.data());
}

export async function createRequirementRecord(data) {
  ensureDb();
  const id = await getNextRequirementId();
  const now = serverTimestamp();
  const newRequirement = {
    title: data.title || "Untitled Requirement",
    module: data.module || "General",
    priority: data.priority || "Medium",
    status: "Draft",
    owner: data.owner || "Unassigned",
    sprint: data.sprint || "Backlog",
    progress: 0,
    description: data.description || "",
    acceptanceCriteria: normalizeArray(data.acceptanceCriteria),
    dependencies: normalizeArray(data.dependencies),
    comments: [],
    activity: [
      {
        id: `a-${Date.now()}`,
        text: "Requirement created from the AI workbench.",
        time: createRelativeTimeLabel()
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(db, REQUIREMENTS_COLLECTION, id), newRequirement);
  return normalizeRequirement(id, newRequirement);
}

export async function updateRequirementRecord(requirementId, data) {
  ensureDb();
  const currentRequirement = await getRequirementById(requirementId);

  if (!currentRequirement) {
    throw new Error("Requirement not found.");
  }

  const updates = {
    title: data.title || currentRequirement.title,
    module: data.module || currentRequirement.module,
    priority: data.priority || currentRequirement.priority,
    status: data.status || currentRequirement.status,
    owner: data.owner || currentRequirement.owner,
    sprint: data.sprint || currentRequirement.sprint,
    progress: Number.isFinite(Number(data.progress)) ? Number(data.progress) : currentRequirement.progress,
    description: data.description || currentRequirement.description,
    acceptanceCriteria: normalizeArray(data.acceptanceCriteria).length > 0 ? normalizeArray(data.acceptanceCriteria) : currentRequirement.acceptanceCriteria,
    dependencies: normalizeArray(data.dependencies).length > 0 ? normalizeArray(data.dependencies) : currentRequirement.dependencies,
    updatedAt: serverTimestamp()
  };

  await updateDoc(doc(db, REQUIREMENTS_COLLECTION, requirementId), updates);
  return {
    ...currentRequirement,
    ...updates
  };
}

export async function deleteRequirementRecord(requirementId) {
  ensureDb();
  await deleteDoc(doc(db, REQUIREMENTS_COLLECTION, requirementId));
}

export async function createRequirementCommentRecord(requirementId, data) {
  ensureDb();
  const currentRequirement = await getRequirementById(requirementId);

  if (!currentRequirement) {
    throw new Error("Requirement not found.");
  }

  const comment = {
    id: `c-${Date.now()}`,
    author: data.author || "Anonymous User",
    role: data.role || "Contributor",
    message: data.message || "",
    time: createRelativeTimeLabel()
  };
  const activityEntry = {
    id: `a-${Date.now()}`,
    text: `${comment.author} added a new discussion comment.`,
    time: createRelativeTimeLabel()
  };

  await updateDoc(doc(db, REQUIREMENTS_COLLECTION, requirementId), {
    comments: [comment, ...(currentRequirement.comments ?? [])],
    activity: [activityEntry, ...(currentRequirement.activity ?? [])],
    updatedAt: serverTimestamp()
  });

  return comment;
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

  return {
    threads: buildCollaborationThreads(requirements),
    members: buildCollaborationMembers(requirements),
    activity: buildActivityFeed(requirements)
  };
}
