import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';

export const Reports: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState('CASE-1021');
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeThreatIntel, setIncludeThreatIntel] = useState(true);
  const [includeFinancial, setIncludeFinancial] = useState(true);
  const [includeGraph, setIncludeGraph] = useState(true);
  const [includeAudit, setIncludeAudit] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto text-left">
      <div>
        <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
          Case Investigation Report Generator
        </h1>
        <p className="text-[13px] text-[#605E5C]">
          Build court-admissible, structured intelligence dossiers with cryptographic chain of custody.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Builder Form (Left Col) */}
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-5 flex flex-col gap-4 shadow-xs">
          <h3 className="text-[14px] font-bold text-[#242424] border-b border-[#E1DFDD] pb-2">
            Report Configuration
          </h3>

          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#323130]">Select Case Dossier</label>
            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="h-8 px-3 text-[13px] bg-white border border-[#E1DFDD] rounded-[4px]"
            >
              <option value="CASE-1021">CASE-1021: P2P UPI Mule Network Analysis</option>
              <option value="CASE-1024">CASE-1024: Phishing Campaign - HDFC Impersonation</option>
              <option value="CASE-1025">CASE-1025: Crypto Investment Scam Network</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 border-t border-[#E1DFDD] pt-3">
            <span className="text-[12px] font-semibold text-[#323130]">Sections to Include</span>
            <label className="flex items-center gap-2 text-[13px] text-[#242424] cursor-pointer">
              <input
                type="checkbox"
                checked={includeEvidence}
                onChange={(e) => setIncludeEvidence(e.target.checked)}
                className="rounded-[2px] text-[#0078D4]"
              />
              <span>Evidence Ledger & SHA-256 Hashes</span>
            </label>
            <label className="flex items-center gap-2 text-[13px] text-[#242424] cursor-pointer">
              <input
                type="checkbox"
                checked={includeThreatIntel}
                onChange={(e) => setIncludeThreatIntel(e.target.checked)}
                className="rounded-[2px] text-[#0078D4]"
              />
              <span>Threat Intelligence Correlation</span>
            </label>
            <label className="flex items-center gap-2 text-[13px] text-[#242424] cursor-pointer">
              <input
                type="checkbox"
                checked={includeFinancial}
                onChange={(e) => setIncludeFinancial(e.target.checked)}
                className="rounded-[2px] text-[#0078D4]"
              />
              <span>Financial Layering & Transaction Flows</span>
            </label>
            <label className="flex items-center gap-2 text-[13px] text-[#242424] cursor-pointer">
              <input
                type="checkbox"
                checked={includeGraph}
                onChange={(e) => setIncludeGraph(e.target.checked)}
                className="rounded-[2px] text-[#0078D4]"
              />
              <span>Entity Knowledge Graph & Cluster Analysis</span>
            </label>
            <label className="flex items-center gap-2 text-[13px] text-[#242424] cursor-pointer">
              <input
                type="checkbox"
                checked={includeAudit}
                onChange={(e) => setIncludeAudit(e.target.checked)}
                className="rounded-[2px] text-[#0078D4]"
              />
              <span>Audit Trail & Human Review Decisions</span>
            </label>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsPreviewOpen(true)}
              leftIcon={<span className="material-symbols-outlined text-[16px]">visibility</span>}
            >
              Generate & Preview
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>}
              >
                Export PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ caseId: selectedCaseId, exportedAt: new Date().toISOString() }, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute('href', dataStr);
                  downloadAnchor.setAttribute('download', `${selectedCaseId}_intelligence_dossier.json`);
                  downloadAnchor.click();
                }}
                leftIcon={<span className="material-symbols-outlined text-[14px]">code</span>}
              >
                Export JSON
              </Button>
            </div>
          </div>
        </div>

        {/* Live Dossier Preview (Right 2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E1DFDD] rounded-[4px] p-6 shadow-xs flex flex-col gap-6">
          {/* Dossier Header */}
          <div className="border-b-2 border-[#242424] pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0078D4] text-[24px]">shield</span>
                <span className="text-[18px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
                  SENTINEL INTELLIGENCE DOSSIER
                </span>
              </div>
              <p className="text-[12px] text-[#605E5C] mt-1 font-mono">
                DOCUMENT REF: DOS-{selectedCaseId}-2026 • STRICTLY CONFIDENTIAL
              </p>
            </div>
            <span className="text-[11px] font-bold bg-[#FDE7E9] text-[#D13438] border border-[#E6A6AA] px-2 py-1 rounded-[4px]">
              HIGH RISK DOSSIER
            </span>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="flex flex-col gap-1.5">
            <h4 className="text-[13px] font-bold text-[#242424] uppercase tracking-wider">
              1. Executive Summary & Assessment
            </h4>
            <p className="text-[13px] text-[#323130] leading-relaxed bg-[#FAFAFA] p-3 border border-[#E1DFDD] rounded-[4px]">
              Multi-agent forensic analysis of {selectedCaseId} indicates a coordinated Layer 1 money mule operation. Approximately ₹12.8 Lakhs in fraudulent UPI proceeds were rapidly layered through 4 bank accounts within 17 minutes of ingestion. Primary mule hub entity <code className="font-mono text-[#0078D4]">fraudster@example</code> connects to 7 correlated investigations.
            </p>
          </div>

          {/* Section 2: Evidence & Chain of Custody */}
          {includeEvidence && (
            <div className="flex flex-col gap-1.5">
              <h4 className="text-[13px] font-bold text-[#242424] uppercase tracking-wider">
                2. Cryptographic Evidence Ledger
              </h4>
              <div className="border border-[#E1DFDD] rounded-[4px] overflow-hidden text-[12px]">
                <div className="grid grid-cols-4 p-2 bg-[#FAFAFA] border-b border-[#E1DFDD] font-semibold text-[#605E5C]">
                  <span>Evidence ID</span>
                  <span>File Name</span>
                  <span className="col-span-2">SHA-256 Integrity Hash</span>
                </div>
                <div className="grid grid-cols-4 p-2 border-b border-[#E1DFDD] font-mono text-[11px]">
                  <span className="text-[#0078D4]">EV-001</span>
                  <span>Txn_Proof_0921.png</span>
                  <span className="col-span-2 truncate text-[#605E5C]">a93f7b2c1d4e5f6a7b8c9d0e1f2a3b4c...</span>
                </div>
                <div className="grid grid-cols-4 p-2 font-mono text-[11px]">
                  <span className="text-[#0078D4]">EV-002</span>
                  <span>Bank_Statement_HDFC.pdf</span>
                  <span className="col-span-2 truncate text-[#605E5C]">b84e9c3d2f1a0b5c6d7e8f9a0b1c2d3e...</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Recommended Enforcement Actions */}
          <div className="flex flex-col gap-1.5">
            <h4 className="text-[13px] font-bold text-[#242424] uppercase tracking-wider">
              3. Recommended Enforcement & Freezing Directives
            </h4>
            <ul className="list-disc pl-5 text-[12px] text-[#323130] space-y-1">
              <li>Issue emergency Section 91 CrPC notice to underlying PSP for immediate UPI VPA freeze.</li>
              <li>Request ICICI Bank to freeze Account #441 pending mule network source verification.</li>
              <li>Submit domain <code className="font-mono text-[#D13438]">hdfc-secure-login.fraudsite.com</code> for registrar-level DNS takedown.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
