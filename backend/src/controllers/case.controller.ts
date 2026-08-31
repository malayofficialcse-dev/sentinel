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
      // 1. Persist entities from extraction and graph analysis
      const allEntityItems = [...(result.entities || []), ...(result.graph?.nodes || []).map((n: any) => ({ entity_type: n.type, value: n.value, normalized_value: n.value, confidence: n.metadata?.confidence || 0.95 }))];
      const entityRows: Array<{ id: string; type: string; value: string }> = [];
      const seenEntities = new Set<string>();

      for (const item of allEntityItems) {
        const type = String(item.entity_type || item.type || "UNKNOWN").toUpperCase();
        const value = String(item.normalized_value || item.value || "").trim();
        if (!value) continue;
        const key = `${type}:${value}`.toLowerCase();
        if (seenEntities.has(key)) continue;
        seenEntities.add(key);

        const entity = await tx.entity.upsert({
          where: { caseId_type_canonicalValue: { caseId, type, canonicalValue: value } },
          create: { caseId, type, canonicalValue: value, displayName: String(item.value || value) },
          update: { displayName: String(item.value || value) }
        });
        await tx.extractedEntity.create({
          data: { evidenceId: evidence.id, entityId: entity.id, type, rawValue: String(item.value || value), normalizedValue: value, confidence: Number(item.confidence || 0.95) }
        });
        entityRows.push({ id: entity.id, type, value });
      }

      // 2. Persist transactions
      for (const item of result.transactions || []) {
        await tx.transaction.create({
          data: {
            caseId,
            sender: String(item.sender || "Source Account"),
            receiver: String(item.receiver || "Beneficiary Account"),
            amount: Number(item.amount || 0),
            currency: String(item.currency || "INR"),
            metadata: item
          }
        });
      }

      // 3. Persist findings from all sources
      const rawFindings: Array<{ source?: string; finding_type?: string; type?: string; description?: string; message?: string; severity?: string; risk_level?: string; confidence?: number }> = [
        ...(result.threat_indicators || []),
        ...(result.financial_findings || []),
        ...(result.graph?.findings || []),
        ...(result.investigation?.findings || []),
      ];

      // Add forensic entity findings if transactions or payment identifiers were extracted
      if ((result.transactions || []).length > 0) {
        for (const txn of result.transactions) {
          rawFindings.push({
            source: "FINANCIAL_OCR",
            type: "TRANSACTION_DETECTED",
            description: `Extracted financial transaction of ₹${Number(txn.amount || 0).toLocaleString()} ${txn.currency || "INR"} directed to ${txn.receiver || "beneficiary"}.`,
            severity: Number(txn.amount || 0) > 50000 ? "HIGH" : "MEDIUM",
            confidence: 0.95
          });
        }
      }

      for (const ent of result.entities || []) {
        if (ent.entity_type === "UPI") {
          rawFindings.push({
            source: "OCR_ENTITY_EXTRACTION",
            type: "UPI_IDENTIFIER_EXTRACTED",
            description: `Identified Virtual Payment Address (UPI ID): ${ent.value}`,
            severity: "MEDIUM",
            confidence: Number(ent.confidence || 0.95)
          });
        }
      }

      for (const item of rawFindings) {
        await tx.finding.create({
          data: {
            caseId,
            category: String(item.source || item.finding_type || "ANALYSIS"),
            title: String(item.type || item.finding_type || "Analysis finding"),
            description: String(item.description || item.message || "Model or rule output recorded."),
            severity: severity(item.severity || item.risk_level || "MEDIUM"),
            confidence: Number(item.confidence ?? 0.9),
            evidenceRefs: [evidence.id],
            analysis: item
          }
        });
      }

      // 4. Persist graph relationship edges
      for (const edge of result.graph?.edges || []) {
        const sourceStr = String(edge.source || "").toLowerCase();
        const targetStr = String(edge.target || "").toLowerCase();
        const source = entityRows.find((e) => `${e.type}:${e.value}`.toLowerCase() === sourceStr || e.value.toLowerCase() === sourceStr);
        const target = entityRows.find((e) => `${e.type}:${e.value}`.toLowerCase() === targetStr || e.value.toLowerCase() === targetStr);
        if (source && target && source.id !== target.id) {
          await tx.relationship.upsert({
            where: { caseId_sourceId_targetId_type: { caseId, sourceId: source.id, targetId: target.id, type: String(edge.type || "RELATED_TO") } },
            create: { caseId, sourceId: source.id, targetId: target.id, type: String(edge.type || "RELATED_TO"), confidence: Number(edge.confidence || 0.9), evidenceId: evidence.id },
            update: { confidence: Number(edge.confidence || 0.9) }
          });
        }
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
  try {
    const item = await prisma.case.findUnique({
      where: { id: String(req.params.caseId) },
      include: {
        evidence: true,
        entities: true,
        transactions: true,
        findings: true,
        relationships: { include: { source: true, target: true } },
        investigations: true,
        riskScores: true,
      },
    });
    if (!item) return res.status(404).json({ success: false, error: "NOT_FOUND", message: "Case not found" });
    return res.json(item);
  }
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

export async function getDashboard(_req: Request, res: Response) {
  try {
    const [totalCases, openCases, highRiskCases, totalEvidence, totalFindings, totalEntities] = await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] } } }),
      prisma.case.count({ where: { severity: { in: ["HIGH", "CRITICAL"] } } }),
      prisma.evidence.count(),
      prisma.finding.count(),
      prisma.entity.count(),
    ]);
    return res.json({ totalCases, openCases, highRiskCases, underReview: 0, totalEvidence, totalFindings, totalEntities });
  } catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}

export async function listEntities(req: Request, res: Response) {
  try {
    const where: Record<string, any> = {};
    if (req.query.type) where.type = String(req.query.type);
    if (req.query.caseId) where.caseId = String(req.query.caseId);
    if (req.query.search) where.canonicalValue = { contains: String(req.query.search), mode: "insensitive" };
    return res.json(await prisma.entity.findMany({ where, orderBy: { type: "asc" }, take: 200 }));
  } catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}

export async function listTransactions(req: Request, res: Response) {
  try {
    const where: Record<string, any> = {};
    if (req.query.caseId) where.caseId = String(req.query.caseId);
    return res.json(await prisma.transaction.findMany({ where, orderBy: { createdAt: "desc" }, take: 500 }));
  } catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}

export async function listFindings(req: Request, res: Response) {
  try {
    const where: Record<string, any> = {};
    if (req.query.caseId) where.caseId = String(req.query.caseId);
    if (req.query.status) where.status = String(req.query.status);
    return res.json(await prisma.finding.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }));
  } catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}

export async function updateFinding(req: Request, res: Response) {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ success: false, error: "VALIDATION_ERROR", message: "status is required" });
    const updated = await prisma.finding.update({
      where: { id: String(req.params.id) },
      data: { status: String(status) as any },
    });
    return res.json(updated);
  } catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}

export async function listAuditLogs(_req: Request, res: Response) {
  // Audit log table not yet implemented in the active schema — return empty list
  return res.json([]);
}

export async function listThreatIntelligence(_req: Request, res: Response) {
  // Threat intelligence feed not yet implemented — return empty list
  return res.json([]);
}

export async function listReports(req: Request, res: Response) {
  try {
    // Reports are derived from cases with completed risk scores and investigations
    const cases = await prisma.case.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        riskScores: { orderBy: { createdAt: "desc" }, take: 1 },
        investigations: { orderBy: { createdAt: "desc" }, take: 1 },
        evidence: { take: 1 },
        _count: { select: { entities: true, findings: true } },
      },
      take: 100,
    });
    const reports = cases.map((c) => ({
      id: c.id,
      caseId: c.id,
      title: c.title,
      reportDate: c.updatedAt,
      status: c.status,
      riskScore: c.riskScores[0]?.score ?? 0,
      riskLevel: c.riskScores[0]?.severity ?? "LOW",
      severity: c.severity,
      entityCount: c._count.entities,
      findingCount: c._count.findings,
      evidenceType: c.evidence[0]?.type ?? "DOCUMENT",
      summary: c.investigations[0]?.narrative ?? "",
      detectedEntities: [],
      riskIndicators: [],
      recommendations: [],
    }));
    // Filter by status if requested
    const filtered = req.query.status ? reports.filter((r) => r.status === req.query.status) : reports;
    return res.json(filtered);
  } catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}

export async function getReport(req: Request, res: Response) {
  try {
    const caseRecord = await prisma.case.findUnique({
      where: { id: String(req.params.id) },
      include: {
        riskScores: { orderBy: { createdAt: "desc" }, take: 1 },
        investigations: { orderBy: { createdAt: "desc" }, take: 1 },
        entities: true,
        findings: true,
        evidence: { take: 1 },
      },
    });
    if (!caseRecord) return res.status(404).json({ success: false, error: "NOT_FOUND", message: "Report not found" });
    const risk = caseRecord.riskScores[0];
    const investigation = caseRecord.investigations[0];
    return res.json({
      id: caseRecord.id,
      caseId: caseRecord.id,
      title: caseRecord.title,
      reportDate: caseRecord.updatedAt,
      status: caseRecord.status,
      riskScore: risk?.score ?? 0,
      riskLevel: risk?.severity ?? "LOW",
      severity: caseRecord.severity,
      evidenceType: caseRecord.evidence[0]?.type ?? "DOCUMENT",
      summary: investigation?.narrative ?? "",
      detectedEntities: caseRecord.entities.map((e) => ({ type: e.type, value: e.canonicalValue, confidence: Number((e as any).confidence ?? 0) })),
      riskIndicators: risk?.factors ? Object.entries(risk.factors as Record<string, any>).map(([k, v]) => ({ label: k, value: String(v) })) : [],
      recommendations: [],
    });
  } catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}

export async function listUsers(_req: Request, res: Response) {
  // User management not yet implemented (auth system commented out) — return empty list
  return res.json([]);
}

export async function listAllEvidence(req: Request, res: Response) {
  try {
    const where: Record<string, any> = {};
    if (req.query.caseId) where.caseId = String(req.query.caseId);
    return res.json(await prisma.evidence.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 }));
  } catch (error) { return res.status(503).json({ success: false, error: "DATABASE_UNAVAILABLE", message: error instanceof Error ? error.message : "Database unavailable" }); }
}

