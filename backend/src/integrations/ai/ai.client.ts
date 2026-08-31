import { AI_CONFIG } from "../../config/ai";

export interface ExtractionRequest {
  evidenceId: string;
  fileUrl?: string;
  text?: string;
}

export interface ExtractionResponse {
  success: boolean;
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;
  transactions?: Array<{
    amount?: number;
    currency?: string;
    date?: string;
    sender?: string;
    receiver?: string;
    reference?: string;
  }>;
  suspiciousClaims?: string[];
}

export class AIClient {

  private async request<T>(
    endpoint: string,
    body: unknown,
    method: "GET" | "POST" = "POST"
  ): Promise<T> {

    const response = await fetch(
      `${AI_CONFIG.baseURL}${endpoint}`,
      {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(
          AI_CONFIG.timeout
        )
      }
    );

    if (!response.ok) {
      throw new Error(
        `AI service failed: ${response.status}`
      );
    }

    return response.json() as Promise<T>;
  }

  async extractEvidence(
    request: ExtractionRequest
  ): Promise<ExtractionResponse> {

    return this.request<ExtractionResponse>(
      "/api/evidence/analyze",
      request
    );
  }

  async resolveEntities(
    payload: unknown
  ) {
    return this.request(
      "/api/v1/entity-resolution",
      payload
    );
  }

  async analyzeThreat(
    payload: unknown
  ) {
    return this.request(
      "/api/v1/threat",
      payload
    );
  }

  async analyzeFinancial(
    payload: unknown
  ) {
    return this.request(
      "/api/v1/financial",
      payload
    );
  }

  async investigate(
    payload: unknown
  ) {
    return this.request(
      "/api/investigation/analyze",
      payload
    );
  }

  async analyzeGraph(payload: unknown) {
    return this.request("/api/graph/analyze", payload);
  }

  async runPipeline(payload: unknown) {
    return this.request("/api/pipeline/run", payload);
  }

  async predictPhishing(payload: unknown) { return this.request("/api/models/phishing/predict", payload); }
  async predictFinancial(payload: unknown) { return this.request("/api/models/financial/predict", payload); }
  async scanMalware(payload: unknown) { return this.request("/api/models/malware/scan", payload); }
  async scanMalwareHash(payload: unknown) { return this.request("/api/models/malware/hash", payload); }
  async modelsInfo() { return this.request("/api/models/info", undefined, "GET"); }

  async analyzeEvidence(file: Express.Multer.File, caseId: string) {
    const form = new FormData();
    const bytes = new Uint8Array(file.buffer);
    form.append("file", new Blob([bytes.buffer as ArrayBuffer], { type: file.mimetype }), file.originalname);
    form.append("case_id", caseId);
    const response = await fetch(`${AI_CONFIG.baseURL}/api/evidence/analyze`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(AI_CONFIG.timeout)
    });
    if (!response.ok) throw new Error(`AI service failed: ${response.status}`);
    return response.json();
  }

  async calculateRisk(
    payload: unknown
  ) {
    return this.request(
      "/api/v1/risk",
      payload
    );
  }

  async generateReport(
    payload: unknown
  ) {
    return this.request(
      "/api/v1/report",
      payload
    );
  }
}

export const aiClient = new AIClient();
