import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { caseApi } from '../../services/caseApi';
import { SeverityBadge, CaseStatusBadge } from '../../components/ui/Badge';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    caseApi.getCaseData(id).then(setData).catch((err) => setError(err instanceof Error ? err.message : 'Backend unavailable'));
  }, [id]);

  if (error) return <div className="p-8 text-[#A4262C]">{error}</div>;
  if (!data) return <div className="p-8 text-[#605E5C]">Loading case data…</div>;

  const evidence = data.evidence || [];
  const entities = data.entities || [];
  const transactions = data.transactions || [];
  const findings = data.findings || [];
  const graph = data.relationships || [];
  const risk = data.riskScores?.[0];

  return <div className="flex-1 p-6 overflow-y-auto text-left bg-[var(--bg-app)]">
    <button className="text-[12px] text-[#0078D4] mb-4" onClick={() => navigate('/investigator/cases')}>← Cases</button>
    <div className="flex flex-wrap items-center gap-3 mb-1"><h1 className="text-[24px] font-bold">{data.title}</h1><SeverityBadge severity={data.severity} size="sm" /><CaseStatusBadge status={data.status} size="sm" /></div>
    <p className="text-[12px] font-mono text-[#605E5C] mb-6">{data.id}</p>
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
      {[['Risk', risk?.score ?? 0], ['Evidence', evidence.length], ['Entities', entities.length], ['Transactions', transactions.length], ['Findings', findings.length], ['Graph edges', graph.length]].map(([label, value]) => <div key={String(label)} className="bg-white border border-[#E1DFDD] rounded p-3"><span className="text-[11px] text-[#605E5C] uppercase">{label}</span><p className="text-[20px] font-bold">{String(value)}</p></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-white border border-[#E1DFDD] rounded p-5"><h2 className="font-bold mb-3">Uploaded Evidence</h2>{evidence.length ? evidence.map((item: any) => <div key={item.id} className="border-b border-[#E1DFDD] py-2"><p className="font-semibold">{item.fileName}</p><p className="text-[11px] text-[#605E5C]">{item.mimeType} · {Number(item.sizeBytes || 0).toLocaleString()} bytes · {item.status}</p></div>) : <p className="text-[#605E5C]">No evidence uploaded for this case.</p>}</section>
      <section className="bg-white border border-[#E1DFDD] rounded p-5"><h2 className="font-bold mb-3">Extracted Entities</h2>{entities.length ? entities.map((item: any) => <div key={item.id} className="border-b border-[#E1DFDD] py-2"><p className="font-mono text-[13px]">{item.canonicalValue}</p><p className="text-[11px] text-[#605E5C]">{item.type}</p></div>) : <p className="text-[#605E5C]">No entities extracted from the submitted evidence.</p>}</section>
      <section className="bg-white border border-[#E1DFDD] rounded p-5"><h2 className="font-bold mb-3">Findings</h2>{findings.length ? findings.map((item: any) => <div key={item.id} className="border-b border-[#E1DFDD] py-2"><p className="font-semibold">{item.title}</p><p className="text-[12px]">{item.description}</p><p className="text-[11px] text-[#605E5C]">{item.category} · {item.severity} · confidence {Number(item.confidence || 0).toFixed(2)}</p></div>) : <p className="text-[#605E5C]">No findings recorded.</p>}</section>
      <section className="bg-white border border-[#E1DFDD] rounded p-5"><h2 className="font-bold mb-3">Transactions and Graph</h2>{transactions.length ? transactions.map((item: any) => <div key={item.id} className="border-b border-[#E1DFDD] py-2"><p>₹{Number(item.amount || 0).toLocaleString()} {item.currency} → {item.receiver || 'receiver not extracted'}</p><p className="text-[11px] text-[#605E5C]">{item.sender || 'sender not extracted'}</p></div>) : <p className="text-[#605E5C]">No transactions extracted.</p>}<p className="text-[11px] text-[#605E5C] mt-3">{graph.length} relationship(s) were constructed from observed data.</p></section>
    </div>
  </div>;
};
