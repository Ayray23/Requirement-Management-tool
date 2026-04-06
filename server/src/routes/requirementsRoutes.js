import { Router } from "express";
import { createRequirement, getRequirementById, getRequirements } from "../controllers/requirementsController.js";

const router = Router();

router.get("/", getRequirements);
router.get("/:id", getRequirementById);
router.post("/", createRequirement);

export default router;
