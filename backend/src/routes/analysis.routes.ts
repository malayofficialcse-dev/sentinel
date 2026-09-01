import { Router } from "express";
import multer from "multer";
import { analyzeEvidence, analyzeGraph, investigateCase } from "../controllers/analysis.controller";
import { financial, malware, malwareHash, phishing, info } from "../controllers/model.controller";
import {
  addEvidence, createCase, getCase, getCaseResource,
  investigateCase as investigatePersistedCase, listCases,
  getDashboard, listEntities, listTransactions, listFindings,
  updateFinding, listAuditLogs, listThreatIntelligence,
  listReports, getReport, listUsers, listAllEvidence,
} from "../controllers/case.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

// Cases
router.post("/cases", createCase);
router.get("/cases", listCases);
router.post("/cases/:caseId/evidence", upload.any(), addEvidence);
router.post("/cases/:caseId/investigate", investigatePersistedCase);
router.get("/cases/:caseId/:resource", getCaseResource);
router.get("/cases/:caseId", getCase);

// Evidence
router.get("/evidence", listAllEvidence);

// Dashboard
router.get("/dashboard", getDashboard);

// Entities
router.get("/entities", listEntities);

// Transactions
router.get("/transactions", listTransactions);

// Findings
router.get("/findings", listFindings);
router.patch("/findings/:id", updateFinding);

// Audit logs
router.get("/audit-logs", listAuditLogs);

// Threat intelligence
router.get("/threat-intelligence", listThreatIntelligence);

// Reports
router.get("/reports", listReports);
router.get("/reports/:id", getReport);

// Users
router.get("/users", listUsers);

// Graph & Investigation (legacy endpoints)
router.post("/graph/analyze", analyzeGraph);
router.post("/investigation/analyze", investigateCase);
router.post("/evidence/:id/analyze", upload.single("file"), analyzeEvidence);

// AI Models
router.post("/models/phishing/predict", phishing);
router.post("/models/financial/predict", financial);
router.post("/models/malware/scan", upload.single("file"), malware);
router.post("/models/malware/hash", malwareHash);
router.get("/models/info", info);

export default router;
