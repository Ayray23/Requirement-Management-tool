const FUNCTIONAL_KEYWORDS = [
  "allow",
  "authenticate",
  "calculate",
  "create",
  "delete",
  "export",
  "generate",
  "import",
  "log in",
  "notify",
  "search",
  "send",
  "store",
  "submit",
  "track",
  "update",
  "view"
];

const NON_FUNCTIONAL_KEYWORDS = [
  "availability",
  "compliance",
  "fast",
  "latency",
  "performance",
  "reliable",
  "response time",
  "scalable",
  "secure",
  "security",
  "uptime",
  "usable"
];

const HIGH_PRIORITY_KEYWORDS = ["critical", "immediately", "must", "payment", "security", "urgent"];
const MEDIUM_PRIORITY_KEYWORDS = ["important", "improve", "should", "support"];
const LOW_PRIORITY_KEYWORDS = ["could", "later", "nice to have", "optional"];
const VAGUE_TERMS = ["appropriate", "easy", "efficient", "fast", "good", "quick", "simple", "soon", "user-friendly"];
const CONFLICT_PAIRS = [
  ["manual", "automatic"],
  ["public", "private"],
  ["required", "optional"],
  ["single factor", "multi-factor"],
  ["email only", "social login"]
];

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length > 2);
}

function jaccardSimilarity(left, right) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return intersection / union;
}

export function classifyRequirementType(title, description) {
  const content = normalizeText(`${title} ${description}`);
  const functionalScore = FUNCTIONAL_KEYWORDS.filter((keyword) => content.includes(keyword)).length;
  const nonFunctionalScore = NON_FUNCTIONAL_KEYWORDS.filter((keyword) => content.includes(keyword)).length;

  if (nonFunctionalScore > functionalScore) {
    return "Non-functional";
  }

  return "Functional";
}

export function suggestPriority(title, description) {
  const content = normalizeText(`${title} ${description}`);

  if (HIGH_PRIORITY_KEYWORDS.some((keyword) => content.includes(keyword))) {
    return "High";
  }

  if (LOW_PRIORITY_KEYWORDS.some((keyword) => content.includes(keyword))) {
    return "Low";
  }

  if (MEDIUM_PRIORITY_KEYWORDS.some((keyword) => content.includes(keyword))) {
    return "Medium";
  }

  return "Medium";
}

export function analyzeClarity(title, description) {
  const content = normalizeText(`${title} ${description}`);
  const vagueTerms = VAGUE_TERMS.filter((term) => content.includes(term));
  const missingMeasure = !/\b\d+(\.\d+)?\b/.test(content);
  const weakModal = !/\b(must|shall|should|will)\b/.test(content);
  const suggestions = [];

  if (vagueTerms.length > 0) {
    suggestions.push(`Replace vague terms like ${vagueTerms.join(", ")} with measurable expectations.`);
  }

  if (missingMeasure) {
    suggestions.push("Add measurable acceptance criteria such as response time, completion rule, or numeric threshold.");
  }

  if (weakModal) {
    suggestions.push("Use a stronger requirement verb such as must, shall, or should.");
  }

  return {
    isClear: suggestions.length === 0,
    vagueTerms,
    suggestions
  };
}

export function rewriteRequirement(title, description, type, priority) {
  const safeTitle = String(title || "Untitled requirement").trim();
  const safeDescription = String(description || "").trim();
  const focus = type === "Non-functional" ? "quality constraint" : "user capability";

  return `${safeTitle}: The system must provide this ${focus} so that stakeholders can achieve the intended outcome. ${safeDescription}`.trim();
}

export function detectDuplicatesAndConflicts(currentRequirement, existingRequirements = []) {
  const baseText = `${currentRequirement.title} ${currentRequirement.description}`;
  const duplicateCandidates = [];
  const conflictCandidates = [];

  existingRequirements.forEach((requirement) => {
    if (!requirement?.id || requirement.id === currentRequirement.id) {
      return;
    }

    const comparisonText = `${requirement.title} ${requirement.description}`;
    const similarity = jaccardSimilarity(baseText, comparisonText);

    if (similarity >= 0.45) {
      duplicateCandidates.push({
        id: requirement.id,
        title: requirement.title,
        similarity: Math.round(similarity * 100),
        project: requirement.project || requirement.module || "General"
      });
    }

    const currentContent = normalizeText(baseText);
    const comparisonContent = normalizeText(comparisonText);
    const conflictReason = CONFLICT_PAIRS.find(
      ([left, right]) =>
        (currentContent.includes(left) && comparisonContent.includes(right)) ||
        (currentContent.includes(right) && comparisonContent.includes(left))
    );

    if (conflictReason) {
      conflictCandidates.push({
        id: requirement.id,
        title: requirement.title,
        reason: `Potential conflict around "${conflictReason[0]}" versus "${conflictReason[1]}".`
      });
    }
  });

  return {
    duplicateCandidates: duplicateCandidates.sort((left, right) => right.similarity - left.similarity).slice(0, 5),
    conflictCandidates: conflictCandidates.slice(0, 5)
  };
}

export function analyzeRequirementDraft(draft, existingRequirements = []) {
  const type = draft.type || classifyRequirementType(draft.title, draft.description);
  const priority = draft.priority || suggestPriority(draft.title, draft.description);
  const clarity = analyzeClarity(draft.title, draft.description);
  const refinement = rewriteRequirement(draft.title, draft.description, type, priority);
  const relationshipInsights = detectDuplicatesAndConflicts(
    {
      id: draft.id,
      title: draft.title,
      description: draft.description
    },
    existingRequirements
  );

  return {
    typeSuggestion: type,
    prioritySuggestion: priority,
    clarity,
    rewrittenRequirement: refinement,
    duplicateCandidates: relationshipInsights.duplicateCandidates,
    conflictCandidates: relationshipInsights.conflictCandidates,
    summary:
      clarity.isClear
        ? "This requirement is reasonably clear and ready for workflow review."
        : "This requirement needs refinement before approval."
  };
}

export function summarizeRequirementPortfolio(requirements = []) {
  if (requirements.length === 0) {
    return "No requirements have been captured yet.";
  }

  const approved = requirements.filter((requirement) => requirement.status === "Approved").length;
  const pending = requirements.filter((requirement) => requirement.status === "Pending").length;
  const highPriority = requirements.filter((requirement) => requirement.priority === "High").length;
  const nonFunctional = requirements.filter((requirement) => requirement.type === "Non-functional").length;

  return `${requirements.length} requirements tracked, ${approved} approved, ${pending} pending review, ${highPriority} high priority, and ${nonFunctional} non-functional quality constraints.`;
}
