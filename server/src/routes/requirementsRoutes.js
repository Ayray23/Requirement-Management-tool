import { Router } from "express";
import {
  createRequirement,
  createRequirementComment,
  deleteRequirement,
  getRequirementById,
  getRequirements,
  updateRequirement
} from "../controllers/requirementsController.js";

const router = Router();

router.get("/", getRequirements);
router.get("/:id", getRequirementById);
router.patch("/:id", updateRequirement);
router.delete("/:id", deleteRequirement);
router.post("/:id/comments", createRequirementComment);
router.post("/", createRequirement);

export default router;
