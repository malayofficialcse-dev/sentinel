import React, { useState } from 'react';
import { mockEvidence } from '../../data/mockData';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Evidence } from '../../types';

export const EvidenceList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [verificationMessage, setVerificationMessage] = useState('');

  const filtered = mockEvidence.filter(
    (e) =>
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.fileName.toLowerCase().includes(search.toLowerCase()) ||
      e.hash.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Evidence>[] = [
    {
      key: 'id',
      header: 'Evidence ID',
      sortable: true,
      width: '120px',
      render: (e) => <span className="font-mono font-medium text-[#0078D4]">{e.id}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      width: '110px',
      render: (e) => (
        <span className="bg-[#F3F2F1] text-[#242424] text-[11px] px-2 py-0.5 rounded-[4px] font-semibold uppercase">
          {e.type}
        </span>
      ),
    },
    {
      key: 'fileName',
      header: 'File Name',
      sortable: true,
      render: (e) => <span className="font-medium text-[#242424]">{e.fileName}</span>,
    },
    {
      key: 'hash',
      header: 'SHA-256 Hash',
      render: (e) => (
        <span className="font-mono text-[11px] text-[#605E5C] truncate block max-w-xs">
          {e.hash}
        </span>
      ),
    },
    {
      key: 'uploadedBy',
      header: 'Uploaded By',
      render: (e) => <span className="text-[12px] text-[#242424]">{e.uploadedBy}</span>,
    },
    {
      key: 'integrityVerified',
      header: 'Integrity',
      width: '130px',
      render: () => (
        <span className="inline-flex items-center gap-1 text-[11px] text-[#107C10] font-bold bg-[#F1FAF1] border border-[#A7D7A7] px-1.5 py-0.5 rounded-[4px]">
          <span className="material-symbols-outlined text-[14px]">verified</span>
          VERIFIED
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      render: (e) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedEvidence(e)}>
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            Evidence Repository & Cryptographic Ledger
          </h1>
          <p className="text-[13px] text-[#605E5C]">
            Tamper-proof evidence records, OCR extractions, and verification hashes.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-3 border border-[#E1DFDD] rounded-[4px]">
        <div className="w-80">
          <Input
            placeholder="Search by ID, file name, or hash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<span className="material-symbols-outlined text-[16px]">search</span>}
          />
        </div>
        <span className="text-[12px] text-[#605E5C] font-mono">{filtered.length} Items Total</span>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyField="id"
        onRowClick={(e) => setSelectedEvidence(e)}
      />

      {/* Evidence Inspection Modal */}
      {selectedEvidence && (
        <Modal
          isOpen={!!selectedEvidence}
          onClose={() => { setSelectedEvidence(null); setVerificationMessage(''); }}
          title={`Evidence Inspection: ${selectedEvidence.id}`}
          maxWidth="lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thumbnail / Original */}
            <div className="bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] p-3 flex flex-col items-center justify-center min-h-[220px]">
              {selectedEvidence.thumbnailUrl ? (
                <img
                  src={selectedEvidence.thumbnailUrl}
                  alt="Original"
                  className="max-h-60 rounded-[4px] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center text-[#8A8886]">
                  <span className="material-symbols-outlined text-[48px]">description</span>
                  <span className="text-[12px] mt-1">{selectedEvidence.fileName}</span>
                </div>
              )}
            </div>

            {/* Metadata Ledger */}
            <div className="flex flex-col gap-2 text-[12px]">
              <div className="p-2.5 bg-[#F1FAF1] border border-[#A7D7A7] rounded-[4px] flex items-center gap-2 text-[#107C10] font-bold">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Cryptographic Integrity Verified (SHA-256)</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setVerificationMessage(`Hash verified for ${selectedEvidence.fileName}. The registered content matches.`)}
                leftIcon={<span className="material-symbols-outlined text-[15px]">verified</span>}
              >
                Verify hash again
              </Button>
              {verificationMessage && <p className="text-[11px] text-[#107C10] font-semibold">{verificationMessage}</p>}
              <div className="bg-[#FAFAFA] p-2.5 rounded-[4px] border border-[#E1DFDD] flex flex-col gap-1 font-mono text-[11px]">
                <span className="text-[#605E5C]">Full Hash:</span>
                <span className="text-[#242424] break-all">{selectedEvidence.hash}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="p-2 border border-[#E1DFDD] rounded-[4px]">
                  <span className="text-[#605E5C] block text-[11px]">MIME Type</span>
                  <span className="font-semibold text-[#242424]">{selectedEvidence.mimeType}</span>
                </div>
                <div className="p-2 border border-[#E1DFDD] rounded-[4px]">
                  <span className="text-[#605E5C] block text-[11px]">Extracted Entities</span>
                  <span className="font-bold text-[#0078D4]">{selectedEvidence.extractedEntities}</span>
                </div>
              </div>
              <p className="text-[11px] text-[#8A8886] mt-2 italic">
                Hash verification confirms that the registered evidence content has not changed. It does not prove that the evidence itself is truthful.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
