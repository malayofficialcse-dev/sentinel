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
  const [graphFullscreen, setGraphFullscreen] = useState(false);

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
    if (!id || !e.target.files || e.target.files.length === 0) return;
    const fileList = Array.from(e.target.files);
    setUploading(true);
    setStatusMessage(null);
    try {
      if (fileList.length === 1) {
        await evidenceApi.uploadFile(id, fileList[0]);
        setStatusMessage(`Evidence "${fileList[0].name}" uploaded and analyzed successfully.`);
      } else {
        await evidenceApi.uploadFiles(id, fileList);
        setStatusMessage(`${fileList.length} evidence files uploaded, OCR-analyzed, and cross-correlated successfully.`);
      }
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
      <div className="flex-1 p-12 text-center text-[14px] text-[var(--text-secondary)]">
        <span className="material-symbols-outlined text-[36px] text-[var(--primary)] animate-spin block mb-3">progress_activity</span>
        Loading case data and evidence ledger…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-8 text-left">
        <div className="bg-[var(--danger-bg)] border border-[var(--danger-border)] rounded-[4px] p-6 text-[var(--danger)] max-w-2xl">
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
  const mappedEntities = (entities as any[]).map((e: any): Entity => ({
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
  }));

  return (
    <div className="flex-1 p-6 overflow-y-auto text-left bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Navigation & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <button
            className="text-[13px] text-[var(--primary)] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            onClick={() => navigate('/investigator/cases')}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Case Ledger
          </button>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-[4px] text-[12px] font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] shadow-xs cursor-pointer transition-colors">
                <span className="material-symbols-outlined text-[16px] text-[var(--primary)]">collections</span>
                {uploading ? 'Analyzing Evidence…' : 'Upload Evidence (Multi)'}
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
          <div className="bg-[var(--success-bg)] border border-[var(--success-border)] rounded-[4px] p-3 text-[var(--success)] text-[13px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Title Header */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-[24px] font-bold text-[var(--text-primary)] font-['Libre_Franklin',sans-serif]">
              {data.title}
            </h1>
            <SeverityBadge severity={data.severity} size="sm" />
            <CaseStatusBadge status={data.status} size="sm" />
          </div>
          <p className="text-[12px] font-mono text-[var(--text-secondary)]">Case ID: {data.id}</p>
          {data.description && (
            <p className="text-[13px] text-[var(--text-body)] mt-1">{data.description}</p>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            ['Risk Score', risk?.score !== undefined ? `${risk.score}/100` : '0/100', 'shield'],
            ['Evidence Files', evidence.length, 'folder_open'],
            ['Extracted IOCs', entities.length, 'fingerprint'],
            ['Transactions', transactions.length, 'receipt_long'],
            ['AI Findings', findings.length, 'psychology'],
            ['Graph Edges', graph.length, 'hub'],
          ].map(([label, value, icon]) => (
            <div key={String(label)} className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-3 shadow-xs flex flex-col justify-between transition-colors">
              <div className="flex items-center justify-between text-[var(--text-secondary)]">
                <span className="text-[11px] font-semibold uppercase">{label}</span>
                <span className="material-symbols-outlined text-[18px] text-[var(--primary)]">{icon}</span>
              </div>
              <p className="text-[20px] font-bold text-[var(--text-primary)] mt-1">{String(value)}</p>
            </div>
          ))}
        </div>

        {/* Content Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Evidence */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-4 shadow-xs transition-colors">
            <h2 className="font-bold text-[14px] text-[var(--text-primary)] mb-3 flex items-center gap-2 border-b border-[var(--border)] pb-2">
              <span className="material-symbols-outlined text-[var(--primary)] text-[18px]">folder_open</span>
              Uploaded Evidence ({evidence.length})
            </h2>
            {evidence.length ? (
              <div className="divide-y divide-[var(--border)]">
                {evidence.map((item: any) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-[13px] text-[var(--text-primary)]">{item.fileName}</p>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {item.mimeType} · {Number(item.sizeBytes || 0).toLocaleString()} bytes · Status: {item.status}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono bg-[var(--surface-hover)] text-[var(--text-secondary)] px-2 py-0.5 rounded-[4px] border border-[var(--border)]">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--text-muted)] py-4 text-center">No evidence uploaded for this case yet.</p>
            )}
          </section>

          {/* Extracted Entities */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-4 shadow-xs transition-colors">
            <h2 className="font-bold text-[14px] text-[var(--text-primary)] mb-3 flex items-center gap-2 border-b border-[var(--border)] pb-2">
              <span className="material-symbols-outlined text-[var(--primary)] text-[18px]">fingerprint</span>
              Extracted Entities & IOCs ({entities.length})
            </h2>
            {entities.length ? (
              <div className="divide-y divide-[var(--border)] max-h-60 overflow-y-auto">
                {entities.map((item: any) => (
                  <div key={item.id} className="py-2 flex justify-between items-center">
                    <p className="font-mono text-[13px] font-medium text-[var(--text-primary)]">{item.canonicalValue}</p>
                    <span className="text-[11px] font-bold bg-[var(--info-bg)] text-[var(--info)] border border-[var(--info-border)] px-2 py-0.5 rounded-[4px]">
                      {item.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--text-muted)] py-4 text-center">No entities extracted from submitted evidence.</p>
            )}
          </section>

          {/* Findings */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-4 shadow-xs transition-colors">
            <h2 className="font-bold text-[14px] text-[var(--text-primary)] mb-3 flex items-center gap-2 border-b border-[var(--border)] pb-2">
              <span className="material-symbols-outlined text-[var(--primary)] text-[18px]">psychology</span>
              AI Findings ({findings.length})
            </h2>
            {findings.length ? (
              <div className="divide-y divide-[var(--border)] max-h-60 overflow-y-auto">
                {findings.map((item: any) => (
                  <div key={item.id} className="py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-[13px] text-[var(--text-primary)]">{item.title}</p>
                      <SeverityBadge severity={item.severity} size="sm" />
                    </div>
                    <p className="text-[12px] text-[var(--text-secondary)]">{item.description}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">
                      Source: {item.category} · Confidence: {(Number(item.confidence || 0) * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--text-muted)] py-4 text-center">No AI findings recorded for this case.</p>
            )}
          </section>

          {/* Transactions & Graph */}
          <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-4 shadow-xs transition-colors">
            <h2 className="font-bold text-[14px] text-[var(--text-primary)] mb-3 flex items-center gap-2 border-b border-[var(--border)] pb-2">
              <span className="material-symbols-outlined text-[var(--primary)] text-[18px]">receipt_long</span>
              Transactions & Relationship Graph ({transactions.length})
            </h2>
            {transactions.length ? (
              <div className="divide-y divide-[var(--border)] max-h-48 overflow-y-auto">
                {transactions.map((item: any) => (
                  <div key={item.id} className="py-2 flex justify-between items-center">
                    <div>
                      <p className="font-mono text-[13px] font-bold text-[var(--text-primary)]">
                        ₹{Number(item.amount || 0).toLocaleString('en-IN')} {item.currency}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {item.sender || 'Sender'} → {item.receiver || 'Receiver'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--text-muted)] py-4 text-center">No transactions extracted from evidence.</p>
            )}
            <p className="text-[11px] text-[var(--text-muted)] mt-3 pt-2 border-t border-[var(--border)]">
              {graph.length} entity relationship edge(s) constructed in graph ledger.
            </p>
          </section>
        </div>

        {/* Visual Interactive Graph Section */}
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[4px] p-4 shadow-xs transition-colors">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-3">
            <h2 className="font-bold text-[14px] text-[var(--text-primary)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--primary)] text-[18px]">hub</span>
              Interactive Entity Relationship Graph ({entities.length} Nodes, {graph.length} Edges)
            </h2>
            <button
              onClick={() => setGraphFullscreen(true)}
              className="text-[12px] font-semibold text-[var(--primary)] hover:underline cursor-pointer"
            >
              Open Fullscreen Graph Explorer →
            </button>
          </div>

          <div className="h-[420px] w-full">
            <GraphViewer entities={mappedEntities} relationships={graph} />
          </div>
        </section>
      </div>

      {graphFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1220]/80 p-4 backdrop-blur-sm">
          <div className="w-full h-full max-w-[1800px] max-h-[95vh] bg-[var(--surface)] border border-[var(--border)] rounded-[10px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
              <div>
                <h3 className="font-bold text-[15px] text-[var(--text-primary)]">Entity Relationship Graph</h3>
                <p className="text-[11px] text-[var(--text-secondary)]">Case: {data?.caseId || id} • {mappedEntities.length} nodes • {graph.length} links</p>
              </div>
              <button
                type="button"
                onClick={() => setGraphFullscreen(false)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-primary)] text-[12px] font-semibold hover:bg-[var(--surface)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
                Close
              </button>
            </div>

            <div className="flex-1 min-h-0 bg-[var(--bg-app)]">
              <GraphViewer entities={mappedEntities} relationships={graph} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
