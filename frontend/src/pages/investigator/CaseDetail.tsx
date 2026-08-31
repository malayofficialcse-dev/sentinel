import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { caseApi } from '../../services/caseApi';
import { evidenceApi } from '../../services/evidenceApi';
import { SeverityBadge, CaseStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { GraphViewer } from '../../components/graph/GraphViewer';
import { Entity } from '../../types';

export const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [investigating, setInvestigating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchCase = (caseId: string) => {
    setLoading(true);
    setError(null);
    caseApi.getCaseData(caseId)
      .then((res) => {
        if (res) setData(res);
        else setError('Case not found.');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Backend unavailable.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) fetchCase(id);
  }, [id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setUploading(true);
    setStatusMessage(null);
    try {
      await evidenceApi.uploadFile(id, file);
      setStatusMessage(`Evidence "${file.name}" uploaded and analyzed successfully.`);
      fetchCase(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload evidence.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRunInvestigation = async () => {
    if (!id) return;
    setInvestigating(true);
    setStatusMessage(null);
    try {
      await caseApi.investigate(id, {});
      setStatusMessage('AI Investigation pipeline completed and results persisted.');
      fetchCase(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI investigation failed.');
    } finally {
      setInvestigating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-12 text-center text-[14px] text-[#605E5C]">
        <span className="material-symbols-outlined text-[36px] text-[#0078D4] animate-spin block mb-3">progress_activity</span>
        Loading case data and evidence ledger…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-8 text-left">
        <div className="bg-[#FDE7E9] border border-[#E6A6AA] rounded-[4px] p-6 text-[#A4262C] max-w-2xl">
          <h2 className="text-[16px] font-bold mb-1">Unable to Load Case</h2>
          <p className="text-[13px]">{error || 'Case not found.'}</p>
          <div className="flex gap-2 mt-4">
            {id && (
              <Button variant="secondary" size="sm" onClick={() => fetchCase(id)}>
                Retry
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => navigate('/investigator/cases')}>
              ← Back to Cases
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const evidence = data.evidence || [];
  const entities = data.entities || [];
  const transactions = data.transactions || [];
  const findings = data.findings || [];
  const graph = data.relationships || [];
  const risk = data.riskScores?.[0];

  return (
    <div className="flex-1 p-6 overflow-y-auto text-left bg-[#F5F5F5]">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1DFDD] pb-3">
          <button
            className="text-[13px] text-[#0078D4] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            onClick={() => navigate('/investigator/cases')}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Case Ledger
          </button>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E1DFDD] rounded-[4px] text-[12px] font-bold text-[#242424] hover:bg-[#F3F2F1] shadow-xs cursor-pointer">
                <span className="material-symbols-outlined text-[16px] text-[#0078D4]">upload_file</span>
                {uploading ? 'Analyzing Evidence…' : 'Upload Evidence'}
              </span>
            </label>

            <Button
              variant="primary"
              size="sm"
              onClick={handleRunInvestigation}
              disabled={investigating}
              leftIcon={<span className="material-symbols-outlined text-[16px]">psychology</span>}
            >
              {investigating ? 'Running AI Pipeline…' : 'Run AI Investigation'}
            </Button>
          </div>
        </div>

        {statusMessage && (
          <div className="bg-[#F1FAF1] border border-[#A7D7A7] rounded-[4px] p-3 text-[#107C10] text-[13px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Title Header */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
              {data.title}
            </h1>
            <SeverityBadge severity={data.severity} size="sm" />
            <CaseStatusBadge status={data.status} size="sm" />
          </div>
          <p className="text-[12px] font-mono text-[#605E5C]">Case ID: {data.id}</p>
          {data.description && (
            <p className="text-[13px] text-[#323130] mt-1">{data.description}</p>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            ['Risk Score', risk?.score ? `${risk.score}/100` : '0/100', 'shield'],
            ['Evidence Files', evidence.length, 'folder_open'],
            ['Extracted IOCs', entities.length, 'fingerprint'],
            ['Transactions', transactions.length, 'receipt_long'],
            ['AI Findings', findings.length, 'psychology'],
            ['Graph Edges', graph.length, 'hub'],
          ].map(([label, value, icon]) => (
            <div key={String(label)} className="bg-white border border-[#E1DFDD] rounded-[4px] p-3 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#605E5C]">
                <span className="text-[11px] font-semibold uppercase">{label}</span>
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
              </div>
              <p className="text-[20px] font-bold text-[#242424] mt-1">{String(value)}</p>
            </div>
          ))}
        </div>

        {/* Content Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Evidence */}
          <section className="bg-white border border-[#E1DFDD] rounded-[4px] p-4 shadow-xs">
            <h2 className="font-bold text-[14px] text-[#242424] mb-3 flex items-center gap-2 border-b border-[#E1DFDD] pb-2">
              <span className="material-symbols-outlined text-[#0078D4] text-[18px]">folder_open</span>
              Uploaded Evidence ({evidence.length})
            </h2>
            {evidence.length ? (
              <div className="divide-y divide-[#E1DFDD]">
                {evidence.map((item: any) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-[13px] text-[#242424]">{item.fileName}</p>
                      <p className="text-[11px] text-[#605E5C]">
                        {item.mimeType} · {Number(item.sizeBytes || 0).toLocaleString()} bytes · Status: {item.status}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono bg-[#F3F2F1] text-[#605E5C] px-2 py-0.5 rounded-[4px]">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#605E5C] py-4 text-center">No evidence uploaded for this case yet.</p>
            )}
          </section>

          {/* Extracted Entities */}
          <section className="bg-white border border-[#E1DFDD] rounded-[4px] p-4 shadow-xs">
            <h2 className="font-bold text-[14px] text-[#242424] mb-3 flex items-center gap-2 border-b border-[#E1DFDD] pb-2">
              <span className="material-symbols-outlined text-[#0078D4] text-[18px]">fingerprint</span>
              Extracted Entities & IOCs ({entities.length})
            </h2>
            {entities.length ? (
              <div className="divide-y divide-[#E1DFDD] max-h-60 overflow-y-auto">
                {entities.map((item: any) => (
                  <div key={item.id} className="py-2 flex justify-between items-center">
                    <p className="font-mono text-[13px] font-medium text-[#242424]">{item.canonicalValue}</p>
                    <span className="text-[11px] font-bold bg-[#EFF6FC] text-[#0078D4] px-2 py-0.5 rounded-[4px]">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#605E5C] py-4 text-center">No entities extracted from submitted evidence.</p>
            )}
          </section>

          {/* Findings */}
          <section className="bg-white border border-[#E1DFDD] rounded-[4px] p-4 shadow-xs">
            <h2 className="font-bold text-[14px] text-[#242424] mb-3 flex items-center gap-2 border-b border-[#E1DFDD] pb-2">
              <span className="material-symbols-outlined text-[#0078D4] text-[18px]">psychology</span>
              AI Findings ({findings.length})
            </h2>
            {findings.length ? (
              <div className="divide-y divide-[#E1DFDD] max-h-60 overflow-y-auto">
                {findings.map((item: any) => (
                  <div key={item.id} className="py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-[13px] text-[#242424]">{item.title}</p>
                      <SeverityBadge severity={item.severity} size="sm" />
                    </div>
                    <p className="text-[12px] text-[#605E5C]">{item.description}</p>
                    <p className="text-[11px] text-[#8A8886] mt-1">
                      Source: {item.category} · Confidence: {(Number(item.confidence || 0) * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#605E5C] py-4 text-center">No AI findings recorded for this case.</p>
            )}
          </section>

          {/* Transactions & Graph */}
          <section className="bg-white border border-[#E1DFDD] rounded-[4px] p-4 shadow-xs">
            <h2 className="font-bold text-[14px] text-[#242424] mb-3 flex items-center gap-2 border-b border-[#E1DFDD] pb-2">
              <span className="material-symbols-outlined text-[#0078D4] text-[18px]">receipt_long</span>
              Transactions & Relationship Graph ({transactions.length})
            </h2>
            {transactions.length ? (
              <div className="divide-y divide-[#E1DFDD] max-h-48 overflow-y-auto">
                {transactions.map((item: any) => (
                  <div key={item.id} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-mono text-[13px] font-bold text-[#242424]">
                        ₹{Number(item.amount || 0).toLocaleString('en-IN')} {item.currency}
                      </p>
                      <p className="text-[11px] text-[#605E5C]">
                        {item.sender || 'Sender'} → {item.receiver || 'Receiver'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#605E5C] py-4 text-center">No transactions extracted from evidence.</p>
            )}
            <p className="text-[11px] text-[#605E5C] mt-3 pt-2 border-t border-[#E1DFDD]">
              {graph.length} entity relationship edge(s) constructed in graph ledger.
            </p>
          </section>
        </div>

        {/* Visual Interactive Graph Section */}
        <section className="bg-white border border-[#E1DFDD] rounded-[4px] p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-2 mb-3">
            <h2 className="font-bold text-[14px] text-[#242424] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0078D4] text-[18px]">hub</span>
              Interactive Entity Relationship Graph ({entities.length} Nodes, {graph.length} Edges)
            </h2>
            <button
              onClick={() => navigate('/investigator/graph')}
              className="text-[12px] font-semibold text-[#0078D4] hover:underline cursor-pointer"
            >
              Open Fullscreen Graph Explorer →
            </button>
          </div>

          <div className="h-[420px] w-full">
            <GraphViewer
              entities={entities.map((e: any): Entity => ({
                id: e.id,
                type: e.type,
                value: e.canonicalValue || e.value || '',
                displayName: e.displayName || e.canonicalValue || '',
                riskScore: Number(e.riskScore ?? 0),
                confidence: Number(e.confidence ?? 100),
                caseCount: 1,
                firstSeen: e.firstSeen || new Date().toISOString(),
                lastSeen: e.lastSeen || new Date().toISOString(),
                metadata: {},
                relatedEntityIds: [],
              }))}
              relationships={graph}
            />
          </div>
        </section>
      </div>
    </div>
  );
};
