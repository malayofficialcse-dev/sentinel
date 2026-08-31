import React, { useEffect, useState } from 'react';
import { findingApi } from '../../services/findingApi';
import { DataTable, Column } from '../../components/ui/DataTable';
import { SeverityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Finding, FindingStatus } from '../../types';

export const Findings: React.FC = () => {
  const [findingsList, setFindingsList] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [reviewAction, setReviewAction] = useState<FindingStatus | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    findingApi.getFindings()
      .then((data) => { if (mounted) setFindingsList(data); })
      .catch((err) => { if (mounted) setError(err instanceof Error ? err.message : 'Unable to load findings. Verify the backend is running.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleReviewSubmit = async () => {
    if (!selectedFinding || !reviewAction) return;
    setSubmitting(true);
    try {
      const updated = await findingApi.updateFindingStatus(selectedFinding.id, reviewAction);
      setFindingsList((prev) => prev.map((f) => f.id === updated.id ? updated : f));
      setSelectedFinding(null);
      setReviewAction(null);
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update finding status.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns: Column<Finding>[] = [
    {
      key: 'id',
      header: 'Finding ID',
      sortable: true,
      width: '110px',
      render: (f) => <span className="font-mono font-medium text-[#0078D4]">{f.id.substring(0, 8).toUpperCase()}…</span>,
    },
    {
      key: 'title',
      header: 'Finding',
      sortable: true,
      render: (f) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[#242424]">{f.title}</span>
          <span className="text-[11px] text-[#605E5C] line-clamp-1">{f.reason}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      width: '110px',
      render: (f) => <SeverityBadge severity={f.severity} size="sm" />,
    },
    {
      key: 'confidence',
      header: 'Confidence',
      sortable: true,
      width: '110px',
      render: (f) => <span className="font-bold text-[12px] text-[#107C10]">{(Number(f.confidence) * 100).toFixed(0)}%</span>,
    },
    {
      key: 'status',
      header: 'Review Status',
      sortable: true,
      width: '130px',
      render: (f) => (
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-[4px] ${
            f.status === FindingStatus.ACCEPTED
              ? 'bg-[#F1FAF1] text-[#107C10] border border-[#A7D7A7]'
              : f.status === FindingStatus.REJECTED
                ? 'bg-[#FDE7E9] text-[#D13438] border border-[#E6A6AA]'
                : 'bg-[#FFF4CE] text-[#CA5010] border border-[#F4C7A1]'
          }`}
        >
          {f.status}
        </span>
      ),
    },
    {
      key: 'agentName',
      header: 'Agent',
      width: '130px',
      render: (f) => <span className="text-[12px] text-[#605E5C] font-medium">{f.agentName}</span>,
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      width: '110px',
      render: (f) => (
        <Button variant="secondary" size="sm" onClick={() => setSelectedFinding(f)}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto text-left">
      <div>
        <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
          AI Findings & Human Oversight Review
        </h1>
        <p className="text-[13px] text-[#605E5C]">
          Review, accept, or reject AI-generated hypotheses from real evidence analysis.
        </p>
      </div>

      {error && (
        <div className="bg-[#FDE7E9] border border-[#E6A6AA] rounded-[4px] p-3 text-[#A4262C] text-[13px]">{error}</div>
      )}

      {loading ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">hourglass_top</span>
          Loading findings…
        </div>
      ) : findingsList.length === 0 ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">search_off</span>
          No findings recorded. Upload and analyze evidence in a case to generate AI findings.
        </div>
      ) : (
        <DataTable columns={columns} data={findingsList} keyField="id" />
      )}

      {/* Human Review Modal */}
      {selectedFinding && (
        <Modal
          isOpen={!!selectedFinding}
          onClose={() => { setSelectedFinding(null); setReviewAction(null); setReason(''); }}
          title={`Human Review: ${selectedFinding.id.substring(0, 8).toUpperCase()}…`}
        >
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="font-bold text-[15px] text-[#242424]">{selectedFinding.title}</h4>
              <p className="text-[13px] text-[#605E5C] mt-1">{selectedFinding.description}</p>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] text-[12px] flex flex-col gap-1">
              <span className="font-semibold text-[#242424]">AI Generated Reasoning:</span>
              <p className="text-[#605E5C]">{selectedFinding.reason}</p>
              <span className="text-[11px] font-mono text-[#0078D4] mt-1">
                Agent: {selectedFinding.agentName} • {(Number(selectedFinding.confidence) * 100).toFixed(0)}% Confidence
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-[#323130]">Human Decision:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { status: FindingStatus.ACCEPTED, label: '✓ Accept Finding', activeClass: 'bg-[#F1FAF1] border-[#107C10] text-[#107C10]' },
                  { status: FindingStatus.REJECTED, label: '✕ Reject Finding', activeClass: 'bg-[#FDE7E9] border-[#D13438] text-[#D13438]' },
                  { status: FindingStatus.NEEDS_REVIEW, label: '? Request Info', activeClass: 'bg-[#FFF4CE] border-[#CA5010] text-[#CA5010]' },
                ].map(({ status, label, activeClass }) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setReviewAction(status)}
                    className={`py-2 text-[12px] font-bold rounded-[4px] border cursor-pointer ${
                      reviewAction === status ? activeClass : 'bg-white border-[#E1DFDD] text-[#605E5C]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              label="Reviewer Justification (Recorded to Audit Log)"
              placeholder="Provide justification for accepting or rejecting this AI hypothesis…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="md" onClick={() => { setSelectedFinding(null); setReviewAction(null); setReason(''); }}>
                Cancel
              </Button>
              <Button variant="primary" size="md" disabled={!reviewAction || submitting} onClick={handleReviewSubmit}>
                {submitting ? 'Saving…' : 'Submit Decision'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
