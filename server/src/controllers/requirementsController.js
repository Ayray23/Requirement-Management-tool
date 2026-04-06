import { requirements } from "../data/mockData.js";

export function getRequirements(req, res) {
  res.json({
    ok: true,
    count: requirements.length,
    data: requirements
  });
}

export function createRequirement(req, res) {
  const payload = req.body ?? {};
  const newRequirement = {
    id: `REQ-${String(requirements.length + 1).padStart(3, "0")}`,
    title: payload.title || "Untitled Requirement",
    module: payload.module || "General",
    priority: payload.priority || "Medium",
    status: "Draft",
    owner: payload.owner || "Unassigned",
    sprint: payload.sprint || "Backlog",
    progress: 0,
    description: payload.description || ""
  };

  requirements.push(newRequirement);

  res.status(201).json({
    ok: true,
    message: "Requirement created in demo mode.",
    data: newRequirement
  });
}
