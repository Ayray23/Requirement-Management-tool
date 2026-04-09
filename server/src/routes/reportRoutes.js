import { Router } from "express";
import { downloadProjectSummaryReport } from "../controllers/reportController.js";

const router = Router();

router.get("/summary", downloadProjectSummaryReport);

export default router;
