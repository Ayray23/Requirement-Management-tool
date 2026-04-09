import {
  addRequirementComment,
  createRequirement as createRequirementRecord,
  getRequirementById as getRequirementRecordById,
  listRequirements
} from "../services/requirementStore.js";

export async function getRequirements(req, res, next) {
  try {
    const requirements = await listRequirements();

    res.json({
      ok: true,
      count: requirements.length,
      data: requirements
    });
  } catch (error) {
    next(error);
  }
}

export async function getRequirementById(req, res, next) {
  try {
    const { id } = req.params;
    const requirement = await getRequirementRecordById(id);

    if (!requirement) {
      res.status(404).json({
        ok: false,
        message: "Requirement not found"
      });
      return;
    }

    res.json({
      ok: true,
      data: requirement
    });
  } catch (error) {
    next(error);
  }
}

export async function createRequirementComment(req, res, next) {
  try {
    const { id } = req.params;
    const payload = req.body ?? {};
    const comment = await addRequirementComment(id, payload);

    if (!comment) {
      res.status(404).json({
        ok: false,
        message: "Requirement not found"
      });
      return;
    }

    res.status(201).json({
      ok: true,
      message: "Comment added successfully.",
      data: comment
    });
  } catch (error) {
    next(error);
  }
}

export async function createRequirement(req, res, next) {
  try {
    const payload = req.body ?? {};
    const newRequirement = await createRequirementRecord(payload);

    res.status(201).json({
      ok: true,
      message: "Requirement saved successfully.",
      data: newRequirement
    });
  } catch (error) {
    next(error);
  }
}
