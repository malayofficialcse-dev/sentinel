import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Step {
  id: string;
  label: string;
  detail: string;
}

export const AnalysisProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: Step[] = [
    { id: '1', label: 'Evidence Received', detail: 'Payload ingested into secure sandbox' },
    { id: '2', label: 'Cryptographic File Integrity Verified', detail: 'SHA-256 hash calculated: a93f7b2c...82d1' },
    { id: '3', label: 'Content & OCR Extraction', detail: 'Extracted text, URLs, UPI handles and entities' },
    { id: '4', label: 'Threat Intelligence Correlation', detail: 'Cross-referencing domain & IP threat feeds' },
    { id: '5', label: 'Financial Anomaly Detection', detail: 'Checking transaction velocity and mule patterns' },
    { id: '6', label: 'Entity Relationship Graph Analysis', detail: 'Mapping connections with known fraudulent clusters' },
    { id: '7', label: 'Explainable Risk Assessment Formed', detail: 'Calculating aggregate risk index & recommendations' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            navigate('/reports/SEN-8F29A', { replace: true });
          }, 800);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(timer);
  }, [navigate, steps.length]);

  return (
    <div className="max-w-xl mx-auto w-full py-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-[4px] bg-[#EFF6FC] text-[#0078D4] flex items-center justify-center mb-4 border border-[#B4D6F0]">
        <span className="material-symbols-outlined text-[32px] animate-spin">progress_activity</span>
      </div>

      <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
        Analyzing your evidence
      </h1>
      <p className="text-[13px] text-[#605E5C] mt-1 max-w-sm">
        Sentinel AI agents are running multi-modal verification and threat correlation.
      </p>

      {/* Progress Checklist */}
      <div className="w-full bg-white border border-[#E1DFDD] rounded-[4px] p-6 mt-8 shadow-xs text-left flex flex-col gap-4">
        {steps.map((step, index) => {
          const isDone = index < currentStepIndex;
          const isRunning = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <span className="material-symbols-outlined text-[#107C10] text-[20px] fill-1">check_circle</span>
                ) : isRunning ? (
                  <span className="material-symbols-outlined text-[#0078D4] text-[20px] animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined text-[#C8C6C4] text-[20px]">radio_button_unchecked</span>
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-[13px] font-semibold ${
                    isDone
                      ? 'text-[#242424]'
                      : isRunning
                        ? 'text-[#0078D4]'
                        : 'text-[#8A8886]'
                  }`}
                >
                  {step.label}
                </span>
                {(isRunning || isDone) && (
                  <span className="text-[11px] text-[#605E5C] font-mono mt-0.5">{step.detail}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
