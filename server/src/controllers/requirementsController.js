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

  res.status(201).json({
    ok: true,
    message: "Requirement created in demo mode.",
    data: {
      id: `REQ-${String(requirements.length + 1).padStart(3, "0")}`,
      ...payload
    }
  });
}
