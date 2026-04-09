import { Router } from "express";
import {
  createRequirement,
  createRequirementComment,
  getRequirementById,
  getRequirements
} from "../controllers/requirementsController.js";

const router = Router();

router.get("/", getRequirements);
router.get("/:id", getRequirementById);
router.post("/:id/comments", createRequirementComment);
router.post("/", createRequirement);

export default router;
