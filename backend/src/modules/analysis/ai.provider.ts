import axios from 'axios';
import { z } from 'zod';

export const structuredEvidenceSchema = z.object({
  entities: z.array(z.object({ type: z.string(), rawValue: z.string(), normalizedValue: z.string(), confidence: z.number().min(0).max(1), evidenceId: z.string() })),
  transactions: z.array(z.record(z.string(), z.unknown())),
  claims: z.array(z.string()),
  relationships: z.array(z.object({ sourceEntity: z.string(), targetEntity: z.string(), relationshipType: z.string(), confidence: z.number().min(0).max(1), evidenceId: z.string() })),
  summary: z.string(),
});
export type StructuredEvidence = z.infer<typeof structuredEvidenceSchema>;

export interface AIProvider {
  extractEvidence(input: { text?: string; imageBase64?: string; mimeType?: string; evidenceId: string }): Promise<StructuredEvidence>;
}

export class OpenAIProvider implements AIProvider {
  constructor(private readonly apiKey: string, private readonly model = process.env.AI_MODEL || 'gpt-4o-mini', private readonly baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1') {}
  async extractEvidence(input: { text?: string; imageBase64?: string; mimeType?: string; evidenceId: string }): Promise<StructuredEvidence> {
    if (!input.text && !input.imageBase64) throw new Error('Extraction requires text or image input');
    const content: Array<Record<string, unknown>> = [];
    if (input.text) content.push({ type: 'text', text: input.text });
    if (input.imageBase64) content.push({ type: 'image_url', image_url: { url: `data:${input.mimeType || 'image/jpeg'};base64,${input.imageBase64}` } });
    const result = await axios.post(`${this.baseUrl}/chat/completions`, { model: this.model, temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: `Extract only observable facts. Return JSON with entities, transactions, claims, relationships and summary. Every entity and relationship evidenceId must be ${input.evidenceId}.` }, { role: 'user', content }] }, { headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, timeout: 60000 });
    const raw = result.data?.choices?.[0]?.message?.content;
    if (typeof raw !== 'string') throw new Error('AI provider returned no structured content');
    return structuredEvidenceSchema.parse(JSON.parse(raw));
  }
}

export function configuredAIProvider(): AIProvider {
  if (!process.env.AI_API_KEY) throw new Error('AI provider is not configured');
  return new OpenAIProvider(process.env.AI_API_KEY);
}
