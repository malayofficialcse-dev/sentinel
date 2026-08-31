import { Router } from "express";
import multer from "multer";
import { analyzeEvidence, analyzeGraph, investigateCase } from "../controllers/analysis.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
router.post("/graph/analyze", analyzeGraph);
router.post("/investigation/analyze", investigateCase);
router.post("/evidence/:id/analyze", upload.single("file"), analyzeEvidence);
router.post("/cases/:caseId/investigate", investigateCase);
export default router;
