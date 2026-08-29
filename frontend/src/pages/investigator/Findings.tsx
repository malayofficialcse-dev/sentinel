import React, { useState } from 'react';
import { mockFindings } from '../../data/mockData';
import { DataTable, Column } from '../../components/ui/DataTable';
import { SeverityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Finding, FindingStatus } from '../../types';

export const Findings: React.FC = () => {
  const [findingsList, setFindingsList] = useState<Finding[]>(mockFindings);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [reviewAction, setReviewAction] = useState<FindingStatus | null>(null);
  const [reason, setReason] = useState('');

  const handleReviewSubmit = () => {
    if (!selectedFinding || !reviewAction) return;
    setFindingsList((prev) =>
      prev.map((f) =>
        f.id === selectedFinding.id
          ? {
              ...f,
              status: reviewAction,
              reviewedBy: 'Rahul Sharma',
              reviewedAt: new Date().toISOString(),
              reviewNotes: reason || 'Reviewed and updated.',
            }
          : f
      )
    );
    setSelectedFinding(null);
    setReviewAction(null);
    setReason('');
  };

  const columns: Column<Finding>[] = [
    {
      key: 'id',
      header: 'Finding ID',
      sortable: true,
      width: '110px',
      render: (f) => <span className="font-mono font-medium text-[#0078D4]">{f.id}</span>,
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
      render: (f) => <span className="font-bold text-[12px] text-[#107C10]">{f.confidence}%</span>,
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
          Review, accept, modify, or reject AI-generated hypotheses with full audit accountability.
        </p>
      </div>

      <DataTable columns={columns} data={findingsList} keyField="id" />

      {/* Human Review Modal */}
      {selectedFinding && (
        <Modal
          isOpen={!!selectedFinding}
          onClose={() => setSelectedFinding(null)}
          title={`Human Review: ${selectedFinding.id}`}
        >
          <div className="flex flex-col gap-4">
            <div>
              <h4 className="font-bold text-[15px] text-[#242424]">{selectedFinding.title}</h4>
              <p className="text-[13px] text-[#605E5C] mt-1">{selectedFinding.description}</p>
            </div>

            <div className="p-3 bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] text-[12px] flex flex-col gap-1">
              <span className="font-semibold text-[#242424]">AI Generated Reasoning:</span>
              <p className="text-[#605E5C]">{selectedFinding.reason}</p>
              <span className="text-[11px] font-mono text-[#0078D4] mt-1">Agent: {selectedFinding.agentName} • {selectedFinding.confidence}% Confidence</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-[#323130]">Human Decision:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewAction(FindingStatus.ACCEPTED)}
                  className={`py-2 text-[12px] font-bold rounded-[4px] border cursor-pointer ${
                    reviewAction === FindingStatus.ACCEPTED
                      ? 'bg-[#F1FAF1] border-[#107C10] text-[#107C10]'
                      : 'bg-white border-[#E1DFDD] text-[#605E5C]'
                  }`}
                >
                  ✓ Accept Finding
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction(FindingStatus.REJECTED)}
                  className={`py-2 text-[12px] font-bold rounded-[4px] border cursor-pointer ${
                    reviewAction === FindingStatus.REJECTED
                      ? 'bg-[#FDE7E9] border-[#D13438] text-[#D13438]'
                      : 'bg-white border-[#E1DFDD] text-[#605E5C]'
                  }`}
                >
                  ✕ Reject Finding
                </button>
                <button
                  type="button"
                  onClick={() => setReviewAction(FindingStatus.NEEDS_REVIEW)}
                  className={`py-2 text-[12px] font-bold rounded-[4px] border cursor-pointer ${
                    reviewAction === FindingStatus.NEEDS_REVIEW
                      ? 'bg-[#FFF4CE] border-[#CA5010] text-[#CA5010]'
                      : 'bg-white border-[#E1DFDD] text-[#605E5C]'
                  }`}
                >
                  ? Request Info
                </button>
              </div>
            </div>

            <Textarea
              label="Reviewer Justification / Reason (Recorded to Audit Log)"
              placeholder="Provide justification for accepting, modifying, or rejecting this AI hypothesis..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="md" onClick={() => setSelectedFinding(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" disabled={!reviewAction} onClick={handleReviewSubmit}>
                Submit Decision
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
