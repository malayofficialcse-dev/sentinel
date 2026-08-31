import crypto from "node:crypto";
import { Request, Response } from "express";
import { prisma } from "../config/database";
import { aiClient } from "../integrations/ai/ai.client";

const severity = (value: unknown): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" => {
  const normalized = String(value || "LOW").toUpperCase();
  return normalized === "CRITICAL" || normalized === "HIGH" || normalized === "MEDIUM" ? normalized : "LOW";
};

const evidenceType = (mime: string): "IMAGE" | "PDF" | "TEXT" => mime === "application/pdf" ? "PDF" : mime.startsWith("image/") ? "IMAGE" : "TEXT";

export async function createCase(req: Request, res: Response) {
  try {
    const created = await prisma.case.create({ data: { title: String(req.body?.title || "Untitled investigation"), description: req.body?.description ? String(req.body.description) : undefined } });
    return res.status(201).json(created);
  } catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}

export async function listCases(_req: Request, res: Response) {
  try { return res.json(await prisma.case.findMany({ orderBy: { updatedAt: "desc" }, include: { _count: { select: { evidence: true, entities: true, transactions: true, findings: true } }, riskScores: { orderBy: { createdAt: "desc" }, take: 1 } } })); }
  catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}

export async function addEvidence(req: Request, res: Response) {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) return res.status(400).json({ success: false, error: "FILE_REQUIRED", message: "An evidence file is required." });
  const caseId = String(req.params.caseId);
  try {
    const result = await aiClient.analyzeEvidence(file, caseId) as Record<string, any>;
    const digest = crypto.createHash("sha256").update(file.buffer).digest("hex");
    const persisted = await prisma.$transaction(async (tx) => {
      const evidence = await tx.evidence.create({ data: { caseId, type: evidenceType(file.mimetype), fileName: file.originalname, storageKey: digest, mimeType: file.mimetype, sizeBytes: BigInt(file.size), sha256: digest, status: "ANALYZED", manualData: { extracted_text: result.extracted_text || "", qr_codes: result.qr_codes || [], warnings: result.extraction_warnings || [] } } });
      const entityRows: Array<{ id: string; type: string; value: string }> = [];
      for (const item of result.entities || []) {
        const type = String(item.entity_type || item.type || "UNKNOWN");
        const value = String(item.normalized_value || item.value || "");
        if (!value) continue;
        const entity = await tx.entity.upsert({ where: { caseId_type_canonicalValue: { caseId, type, canonicalValue: value } }, create: { caseId, type, canonicalValue: value, displayName: String(item.value || value) }, update: { displayName: String(item.value || value) } });
        await tx.extractedEntity.create({ data: { evidenceId: evidence.id, entityId: entity.id, type, rawValue: String(item.value || value), normalizedValue: value, confidence: Number(item.confidence || 0) } });
        entityRows.push({ id: entity.id, type, value });
      }
      for (const item of result.transactions || []) await tx.transaction.create({ data: { caseId, sender: String(item.sender || ""), receiver: String(item.receiver || ""), amount: Number(item.amount || 0), currency: String(item.currency || "INR"), metadata: item } });
      for (const item of [...(result.threat_indicators || []), ...(result.financial_findings || [])]) await tx.finding.create({ data: { caseId, category: String(item.source || item.finding_type || "ANALYSIS"), title: String(item.type || item.finding_type || "Analysis finding"), description: String(item.description || item.message || item.reasons?.[0] || "Model or rule output recorded."), severity: severity(item.severity || item.risk_level), confidence: Number(item.confidence ?? item.fraud_probability ?? item.probability ?? 0), evidenceRefs: [evidence.id], analysis: item } });
      for (const edge of result.graph?.edges || []) {
        const source = entityRows.find((e) => `${e.type}:${e.value}` === edge.source);
        const target = entityRows.find((e) => `${e.type}:${e.value}` === edge.target);
        if (source && target) await tx.relationship.upsert({ where: { caseId_sourceId_targetId_type: { caseId, sourceId: source.id, targetId: target.id, type: String(edge.type || "RELATED_TO") } }, create: { caseId, sourceId: source.id, targetId: target.id, type: String(edge.type || "RELATED_TO"), confidence: Number(edge.confidence || 0), evidenceId: evidence.id }, update: { confidence: Number(edge.confidence || 0) } });
      }
      if (result.investigation) await tx.investigation.create({ data: { caseId, status: "COMPLETE", narrative: String(result.investigation.summary || ""), result: result.investigation } });
      if (result.risk) await tx.riskScore.create({ data: { caseId, score: Number(result.risk.score || 0), severity: severity(result.risk.level), factors: result.risk.factors || {}, explanation: `Risk score ${Number(result.risk.score || 0)}/100 from pipeline outputs.`, evidenceRefs: [evidence.id] } });
      return evidence;
    });
    return res.status(201).json({
      success: true,
      evidence: { ...persisted, sizeBytes: Number(persisted.sizeBytes) },
      analysis: result
    });
  } catch (error) { return res.status(502).json({ success: false, error: "INVESTIGATION_PERSISTENCE_FAILED", message: error instanceof Error ? error.message : "Evidence processing failed" }); }
}

export async function getCase(req: Request, res: Response) {
  try { return res.json(await prisma.case.findUnique({ where: { id: String(req.params.caseId) }, include: { evidence: true, entities: true, transactions: true, findings: true, relationships: true, investigations: true, riskScores: true } })); }
  catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}

export async function investigateCase(req: Request, res: Response) {
  const caseId = String(req.params.caseId);
  try {
    const result = await aiClient.runPipeline({ ...req.body, case_id: caseId }) as Record<string, any>;
    const saved = await prisma.$transaction(async (tx) => {
      const investigation = result.investigation ? await tx.investigation.create({ data: { caseId, status: "COMPLETE", narrative: String(result.investigation.summary || ""), result: result.investigation } }) : null;
      const risk = result.risk ? await tx.riskScore.create({ data: { caseId, score: Number(result.risk.score || 0), severity: severity(result.risk.level), factors: result.risk.factors || {}, explanation: `Risk score ${Number(result.risk.score || 0)}/100 from pipeline outputs.`, evidenceRefs: [] } }) : null;
      return { investigation, risk };
    });
    return res.json({ success: true, analysis: result, persisted: saved });
  } catch (error) { return res.status(502).json({ success: false, error: "INVESTIGATION_FAILED", message: error instanceof Error ? error.message : "Investigation failed" }); }
}

export async function getCaseResource(req: Request, res: Response) {
  const resourceMap: Record<string, string> = { evidence: "evidence", entities: "entities", transactions: "transactions", findings: "findings", graph: "relationships", investigation: "investigations", risk: "riskScores" };
  const resource = resourceMap[String(req.params.resource)];
  if (!resource) return res.status(404).json({ success: false, error: "RESOURCE_NOT_FOUND" });
  try {
    const record = await prisma.case.findUnique({ where: { id: String(req.params.caseId) }, select: { [resource]: true } } as any) as Record<string, any> | null;
    return res.json(record?.[resource] || []);
  } catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}
