import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Hero Section matching Screen 1 */}
      <section className="w-full px-6 py-24 flex flex-col items-center justify-center text-center bg-white border-b border-[#E1DFDD] relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 bg-dot-pattern pointer-events-none" />
        <div className="z-10 max-w-4xl flex flex-col items-center">
          <div className="mb-4 px-3 py-1 bg-[#FAFAFA] rounded-[4px] border border-[#E1DFDD] text-[11px] font-semibold text-[#605E5C] inline-flex items-center space-x-2 tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#0078D4]" />
            <span>ENTERPRISE GRADE INTELLIGENCE</span>
          </div>
          <h1 className="text-[40px] md:text-[52px] font-extrabold text-[#242424] font-['Libre_Franklin',sans-serif] tracking-tight leading-tight mb-4">
            AI-Powered Fraud Investigation
          </h1>
          <p className="text-[16px] md:text-[18px] text-[#605E5C] max-w-2xl mb-8 leading-relaxed">
            Turn suspicious messages, images, URLs and transactions into structured, explainable intelligence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/report')}
              className="text-[14px] px-6 h-10 shadow-xs"
            >
              Report Suspicious Activity
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/investigator')}
              className="text-[14px] px-6 h-10"
            >
              Explore Platform
            </Button>
          </div>
        </div>
      </section>

      {/* Process Flow Visual Section matching Screen 1 */}
      <section id="pipeline" className="w-full px-6 py-16 bg-[#F5F5F5] border-b border-[#E1DFDD] flex justify-center">
        <div className="max-w-6xl w-full">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-[20px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">The Intelligence Pipeline</h2>
            <p className="text-[13px] text-[#605E5C] mt-0.5">Automated analysis and structural extraction flow.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Step 1: Evidence */}
            <div className="flex flex-col items-center justify-center bg-white border border-[#E1DFDD] rounded-[4px] p-4 h-36 relative text-center">
              <span className="material-symbols-outlined text-[#0078D4] mb-2 text-[26px]">inventory_2</span>
              <span className="text-[13px] font-bold text-[#242424]">Evidence</span>
              <span className="text-[11px] text-[#605E5C] mt-0.5">Raw Data Ingestion</span>
            </div>

            {/* Step 2: AI Analysis */}
            <div className="flex flex-col items-center justify-center bg-white border border-[#E1DFDD] border-l-3 border-l-[#0078D4] rounded-[4px] p-4 h-36 relative text-center">
              <span className="material-symbols-outlined text-[#0078D4] mb-2 text-[26px]">psychology</span>
              <span className="text-[13px] font-bold text-[#242424]">AI Analysis</span>
              <span className="text-[11px] text-[#605E5C] mt-0.5">NLP & Computer Vision</span>
            </div>

            {/* Step 3: Threat Intel */}
            <div className="flex flex-col items-center justify-center bg-white border border-[#E1DFDD] rounded-[4px] p-4 h-36 relative text-center">
              <span className="material-symbols-outlined text-[#0078D4] mb-2 text-[26px]">security</span>
              <span className="text-[13px] font-bold text-[#242424]">Threat Intel</span>
              <span className="text-[11px] text-[#605E5C] mt-0.5">Enrichment & Correlation</span>
            </div>

            {/* Step 4: Risk Assessment */}
            <div className="flex flex-col items-center justify-center bg-white border border-[#E1DFDD] rounded-[4px] p-4 h-36 relative text-center">
              <span className="material-symbols-outlined text-[#D13438] mb-2 text-[26px]">analytics</span>
              <span className="text-[13px] font-bold text-[#242424]">Risk Assessment</span>
              <span className="text-[11px] text-[#605E5C] mt-0.5">Scoring & Prioritization</span>
            </div>

            {/* Step 5: Investigation */}
            <div className="flex flex-col items-center justify-center bg-white border border-[#E1DFDD] rounded-[4px] p-4 h-36 relative text-center">
              <span className="material-symbols-outlined text-[#0078D4] mb-2 text-[26px]">hub</span>
              <span className="text-[13px] font-bold text-[#242424]">Investigation</span>
              <span className="text-[11px] text-[#605E5C] mt-0.5">Graph & Timeline</span>
            </div>

            {/* Step 6: Report */}
            <div className="flex flex-col items-center justify-center bg-white border border-[#E1DFDD] rounded-[4px] p-4 h-36 text-center">
              <span className="material-symbols-outlined text-[#0078D4] mb-2 text-[26px]">description</span>
              <span className="text-[13px] font-bold text-[#242424]">Report</span>
              <span className="text-[11px] text-[#605E5C] mt-0.5">Structured Output</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Proposition */}
      <section id="how-it-works" className="w-full px-6 py-16 bg-white flex justify-center">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-[4px] bg-[#EFF6FC] text-[#0078D4] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <h3 className="text-[15px] font-bold text-[#242424]">Cryptographic Integrity</h3>
            <p className="text-[13px] text-[#605E5C] leading-relaxed">
              Every uploaded screenshot, document, or audio is hashed with SHA-256 for tamper-proof chain of custody.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-[4px] bg-[#EFF6FC] text-[#0078D4] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[22px]">account_tree</span>
            </div>
            <h3 className="text-[15px] font-bold text-[#242424]">Entity Knowledge Graph</h3>
            <p className="text-[13px] text-[#605E5C] leading-relaxed">
              Automatically correlate phone numbers, UPI IDs, bank accounts, and domain clusters across all active cases.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-[4px] bg-[#EFF6FC] text-[#0078D4] flex items-center justify-center mb-1">
              <span className="material-symbols-outlined text-[22px]">health_and_safety</span>
            </div>
            <h3 className="text-[15px] font-bold text-[#242424]">Human-in-the-Loop AI</h3>
            <p className="text-[13px] text-[#605E5C] leading-relaxed">
              AI outputs are clear hypotheses, not black-box judgements. Authorized reviewers validate all final findings.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
