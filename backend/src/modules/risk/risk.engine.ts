export type RiskFactor = { category: 'THREAT' | 'FINANCIAL' | 'ENTITY' | 'GRAPH' | 'EVIDENCE'; score: number; reason: string; evidenceReferences: string[] };
export function calculateRisk(factors: RiskFactor[]) {
  const weights = { THREAT: 0.25, FINANCIAL: 0.25, ENTITY: 0.2, GRAPH: 0.15, EVIDENCE: 0.15 };
  const grouped = Object.keys(weights).map((category) => { const items = factors.filter((f) => f.category === category); const score = items.length ? Math.min(100, Math.max(...items.map((f) => f.score))) : 0; return { category, score, reasons: items.map((f) => f.reason) }; });
  const score = Math.round(grouped.reduce((sum, item) => sum + item.score * weights[item.category as keyof typeof weights], 0) * 100) / 100;
  const severity = score >= 90 ? 'CRITICAL' : score >= 70 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';
  return { score, severity, factors: grouped, explanation: `Risk score ${score}/100 based on ${factors.length} traceable factor(s).`, evidenceReferences: [...new Set(factors.flatMap((f) => f.evidenceReferences))] };
}
