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
    body: unknown
  ): Promise<T> {

    const response = await fetch(
      `${AI_CONFIG.baseURL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
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
      "/api/v1/extraction",
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
      "/api/v1/investigation",
      payload
    );
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