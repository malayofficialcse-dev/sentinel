import { apiClient } from './api';

export interface ModelInfo { id: string; name?: string; category?: string; algorithm?: string; accuracy?: number | string; precision?: number | string; recall?: number | string; f1_score?: number | string; training_rows?: number; features_count?: number; input_type?: string; status: string; description?: string; endpoint?: string; }
export interface PhishingPredictResponse { url: string; domain?: string; is_phishing: boolean; phishing_probability: number; risk: { score: number; level: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL' }; reasons: string[]; features: Record<string, number>; indicators: Array<Record<string, unknown>>; model_available: boolean; }
export interface FinancialPredictParams { type: string; amount: number; oldbalanceOrg: number; newbalanceOrig: number; oldbalanceDest: number; newbalanceDest: number; step?: number; isFlaggedFraud?: number; }
export interface FinancialPredictResponse { is_fraud: boolean; fraud_probability: number; risk_score: number; risk_level: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'; model_name: string; accuracy?: number|string; features: Record<string, unknown>; reasons: string[]; model_loaded: boolean; }
export interface MalwareScanResponse { filename?: string; hash?: string; file_size_bytes?: number; md5?: string; sha256?: string; entropy?: number; is_pe_binary?: boolean; is_malware: boolean; malware_probability: number; risk_score: number; risk_level: 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'; threat_type: string; detected_signatures?: string[]; reasons: string[]; feature_count?: number; }

export const modelApi = {
  async getModelsInfo(): Promise<ModelInfo[]> {
    const res = await apiClient.get('/models/info');
    // The Node API may return either the direct payload or an envelope.
    // Validate it here so malformed/unavailable AI responses never reach a
    // component that expects an array.
    const payload = res.data?.data ?? res.data;
    if (!Array.isArray(payload?.models)) {
      throw new Error('AI model metadata response is invalid.');
    }
    return payload.models;
  },
  async predictPhishing(url: string): Promise<PhishingPredictResponse> { const res = await apiClient.post('/models/phishing/predict', { url }); return res.data; },
  async predictFinancial(params: FinancialPredictParams): Promise<FinancialPredictResponse> { const res = await apiClient.post('/models/financial/predict', params); return res.data; },
  async scanMalwareFile(file: File): Promise<MalwareScanResponse> { const form = new FormData(); form.append('file', file); const res = await apiClient.post('/models/malware/scan', form, { headers: { 'Content-Type': 'multipart/form-data' } }); return res.data; },
  async scanMalwareHash(hash: string): Promise<MalwareScanResponse> { const res = await apiClient.post('/models/malware/hash', { hash }); return res.data; },
};
