import { getFirestoreDb } from "../config/firebase.js";
import {
  requirementActivity,
  requirementComments,
  requirements
} from "../data/mockData.js";

const REQUIREMENTS_COLLECTION = "requirements";

function cloneRequirement(requirement) {
  return {
    ...requirement,
    acceptanceCriteria: [...(requirement.acceptanceCriteria ?? [])],
    dependencies: [...(requirement.dependencies ?? [])]
  };
}

function cloneComment(comment) {
  return { ...comment };
}

function cloneActivity(activity) {
  return { ...activity };
}

function createRelativeTimeLabel() {
  return "Just now";
}

function createRequirementId(nextCount) {
  return `REQ-${String(nextCount).padStart(3, "0")}`;
}

function createCollectionSnapshot() {
  return requirements.map((requirement) => ({
    ...cloneRequirement(requirement),
    comments: requirementComments
      .filter((comment) => comment.requirementId === requirement.id)
      .map(cloneComment),
    activity: requirementActivity
      .filter((item) => item.requirementId === requirement.id)
      .map(cloneActivity)
  }));
}

async function ensureFirestoreSeedData(db) {
  const collection = db.collection(REQUIREMENTS_COLLECTION);
  const snapshot = await collection.limit(1).get();

  if (!snapshot.empty) {
    return;
  }

  const seedData = createCollectionSnapshot();

  await Promise.all(
    seedData.map((requirement) =>
      collection.doc(requirement.id).set({
        ...requirement,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    )
  );
}

async function getFirestoreCollection() {
  const db = getFirestoreDb();

  if (!db) {
    return null;
  }

  await ensureFirestoreSeedData(db);
  return db.collection(REQUIREMENTS_COLLECTION);
}

async function listRequirementsFromFirestore(collection) {
  const snapshot = await collection.get();
  return snapshot.docs.map((document) => {
    const data = document.data();
    return {
      ...data,
      id: document.id
    };
  });
}

function toRequirementSummary(requirement) {
  return {
    id: requirement.id,
    title: requirement.title,
    status: requirement.status,
    priority: requirement.priority,
    module: requirement.module,
    owner: requirement.owner,
    sprint: requirement.sprint,
    progress: requirement.progress,
    description: requirement.description
  };
}

export async function listRequirements() {
  const collection = await getFirestoreCollection();

  if (collection) {
    const firestoreRequirements = await listRequirementsFromFirestore(collection);
    return firestoreRequirements.map(toRequirementSummary);
  }

  return requirements.map(cloneRequirement);
}

export async function getRequirementById(id) {
  const collection = await getFirestoreCollection();

  if (collection) {
    const document = await collection.doc(id).get();

    if (!document.exists) {
      return null;
    }

    return {
      ...document.data(),
      id: document.id
    };
  }

  const requirement = requirements.find((item) => item.id === id);

  if (!requirement) {
    return null;
  }

  return {
    ...cloneRequirement(requirement),
    comments: requirementComments
      .filter((comment) => comment.requirementId === id)
      .map(cloneComment),
    activity: requirementActivity
      .filter((item) => item.requirementId === id)
      .map(cloneActivity)
  };
}

export async function createRequirement(input) {
  const collection = await getFirestoreCollection();
  const now = new Date().toISOString();

  if (collection) {
    const existingRequirements = await listRequirementsFromFirestore(collection);
    const newRequirement = {
      id: createRequirementId(existingRequirements.length + 1),
      title: input.title || "Untitled Requirement",
      module: input.module || "General",
      priority: input.priority || "Medium",
      status: "Draft",
      owner: input.owner || "Unassigned",
      sprint: input.sprint || "Backlog",
      progress: 0,
      description: input.description || "",
      acceptanceCriteria: [],
      dependencies: [],
      comments: [],
      activity: [
        {
          id: `a${Date.now()}`,
          requirementId: createRequirementId(existingRequirements.length + 1),
          text: "Requirement created from the AI workbench.",
          time: createRelativeTimeLabel()
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    await collection.doc(newRequirement.id).set(newRequirement);
    return newRequirement;
  }

  const newRequirement = {
    id: createRequirementId(requirements.length + 1),
    title: input.title || "Untitled Requirement",
    module: input.module || "General",
    priority: input.priority || "Medium",
    status: "Draft",
    owner: input.owner || "Unassigned",
    sprint: input.sprint || "Backlog",
    progress: 0,
    description: input.description || "",
    acceptanceCriteria: [],
    dependencies: []
  };

  requirements.push(newRequirement);
  requirementActivity.unshift({
    id: `a${requirementActivity.length + 1}`,
    requirementId: newRequirement.id,
    text: "Requirement created from the AI workbench.",
    time: createRelativeTimeLabel()
  });

  return {
    ...cloneRequirement(newRequirement),
    comments: [],
    activity: requirementActivity
      .filter((item) => item.requirementId === newRequirement.id)
      .map(cloneActivity)
  };
}

export async function addRequirementComment(id, input) {
  const collection = await getFirestoreCollection();
  const comment = {
    id: `c${Date.now()}`,
    requirementId: id,
    author: input.author || "Anonymous User",
    role: input.role || "Contributor",
    message: input.message || "",
    time: createRelativeTimeLabel()
  };
  const activityEntry = {
    id: `a${Date.now() + 1}`,
    requirementId: id,
    text: `${comment.author} added a new discussion comment.`,
    time: createRelativeTimeLabel()
  };

  if (collection) {
    const document = await collection.doc(id).get();

    if (!document.exists) {
      return null;
    }

    const requirement = document.data();
    const comments = [comment, ...(requirement.comments ?? [])];
    const activity = [activityEntry, ...(requirement.activity ?? [])];

    await collection.doc(id).update({
      comments,
      activity,
      updatedAt: new Date().toISOString()
    });

    return comment;
  }

  const requirement = requirements.find((item) => item.id === id);

  if (!requirement) {
    return null;
  }

  requirementComments.unshift(comment);
  requirementActivity.unshift(activityEntry);

  return comment;
}
