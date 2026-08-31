import { Request, Response } from "express";
import { aiClient } from "../integrations/ai/ai.client";

async function forward(fn: Promise<unknown>, res: Response) {
  try { res.json(await fn); }
  catch (error) { res.status(502).json({ code: "AI_SERVICE_UNAVAILABLE", message: "AI analysis service is currently unavailable." }); }
}
export function phishing(req: Request, res: Response) { return forward(aiClient.predictPhishing({ url: req.body?.url }), res); }
export function financial(req: Request, res: Response) { return forward(aiClient.predictFinancial(req.body), res); }
export function malware(req: Request, res: Response) {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  if (!file) return res.status(400).json({ code: "FILE_REQUIRED", message: "A file is required." });
  return forward(aiClient.scanMalware({ filename: file.originalname, mime_type: file.mimetype, file_base64: file.buffer.toString("base64") }), res);
}
export function malwareHash(req: Request, res: Response) { return forward(aiClient.scanMalwareHash({ hash: req.body?.hash }), res); }
export function info(_req: Request, res: Response) { return forward(aiClient.modelsInfo(), res); }
