import { Request, Response } from "express";
import { aiClient } from "../integrations/ai/ai.client";

function body(req: Request) {
  return { case_id: String(req.body?.case_id || req.params.caseId || ""), evidence: req.body?.evidence || [], entities: req.body?.entities || [], transactions: req.body?.transactions || [], indicators: req.body?.indicators || [] };
}

export async function analyzeGraph(req: Request, res: Response) {
  try { res.json(await aiClient.analyzeGraph(body(req))); }
  catch (error) { res.status(502).json({ code: "AI_SERVICE_ERROR", message: error instanceof Error ? error.message : "AI service unavailable" }); }
}

export async function investigateCase(req: Request, res: Response) {
  try { res.json(await aiClient.runPipeline(body(req))); }
  catch (error) { res.status(502).json({ code: "AI_SERVICE_ERROR", message: error instanceof Error ? error.message : "AI service unavailable" }); }
}

export async function analyzeEvidence(req: Request, res: Response) {
  try {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    const payload = { ...body(req), evidence: [{ id: String(req.body?.evidence_id || ""), file_name: file?.originalname, mime_type: file?.mimetype, size: file?.size }] };
    res.json(await aiClient.runPipeline(payload));
  } catch (error) { res.status(502).json({ code: "AI_SERVICE_ERROR", message: error instanceof Error ? error.message : "AI service unavailable" }); }
}
