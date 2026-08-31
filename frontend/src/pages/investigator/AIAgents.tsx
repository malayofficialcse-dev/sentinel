import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mockAIAgents } from '../../data/mockData';
import { Button } from '../../components/ui/Button';

export const AIAgents: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1DFDD] pb-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            Autonomous AI Agent Execution & Monitoring
          </h1>
          <p className="text-[13px] text-[#605E5C]">
            Multi-agent orchestration analyzing evidence extraction, NLP indicators, financial anomalies, and graph clustering.
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/investigator/models')}>
          Launch AI Model Hub →
        </Button>
      </div>

      {/* Model Sandbox Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/investigator/models/phishing')}
          className="bg-white border border-[#E1DFDD] hover:border-[#0078D4] p-4 rounded-[6px] cursor-pointer transition-all shadow-xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <span className="text-[24px]">🔗</span>
            <div>
              <h4 className="font-bold text-[14px] text-[#242424] group-hover:text-[#0078D4]">Phishing URL Classifier</h4>
              <span className="text-[11px] text-[#605E5C]">22 Structural Features (96.5% Acc)</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] text-[#605E5C] group-hover:text-[#0078D4]">chevron_right</span>
        </div>

        <div
          onClick={() => navigate('/investigator/models/financial')}
          className="bg-white border border-[#E1DFDD] hover:border-[#0078D4] p-4 rounded-[6px] cursor-pointer transition-all shadow-xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <span className="text-[24px]">💳</span>
            <div>
              <h4 className="font-bold text-[14px] text-[#242424] group-hover:text-[#0078D4]">Financial Fraud Classifier</h4>
              <span className="text-[11px] text-[#605E5C]">PaySim Random Forest (99.99% Acc)</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] text-[#605E5C] group-hover:text-[#0078D4]">chevron_right</span>
        </div>

        <div
          onClick={() => navigate('/investigator/models/malware')}
          className="bg-white border border-[#E1DFDD] hover:border-[#0078D4] p-4 rounded-[6px] cursor-pointer transition-all shadow-xs flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <span className="text-[24px]">🛡️</span>
            <div>
              <h4 className="font-bold text-[14px] text-[#242424] group-hover:text-[#0078D4]">Malware Threat Scanner</h4>
              <span className="text-[11px] text-[#605E5C]">Static Entropy & IOC Analysis</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] text-[#605E5C] group-hover:text-[#0078D4]">chevron_right</span>
        </div>
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAIAgents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white border border-[#E1DFDD] rounded-[6px] p-5 flex flex-col gap-3 shadow-xs hover:border-[#0078D4] transition-colors"
          >
            <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[4px] bg-[#EFF6FC] text-[#0078D4] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">{agent.icon}</span>
                </div>
                <div className="flex flex-col">
                  <h3 className="font-bold text-[14px] text-[#242424]">{agent.name}</h3>
                  <span className="text-[11px] font-mono text-[#605E5C]">{agent.id}</span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wider ${
                  agent.status === 'completed'
                    ? 'bg-[#F1FAF1] text-[#107C10] border border-[#A7D7A7]'
                    : agent.status === 'running'
                      ? 'bg-[#EFF6FC] text-[#0078D4] border border-[#B4D6F0] animate-pulse'
                      : 'bg-[#F3F2F1] text-[#605E5C]'
                }`}
              >
                {agent.status}
              </span>
            </div>

            <p className="text-[12px] text-[#605E5C] leading-normal">{agent.description}</p>

            <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] text-center text-[11px]">
              <div>
                <span className="text-[#605E5C] block">Entities</span>
                <span className="font-bold text-[#242424]">{agent.entitiesExtracted}</span>
              </div>
              <div>
                <span className="text-[#605E5C] block">Indicators</span>
                <span className="font-bold text-[#242424]">{agent.indicatorsFound}</span>
              </div>
              <div>
                <span className="text-[#605E5C] block">Confidence</span>
                <span className="font-bold text-[#107C10]">{agent.confidence ? `${agent.confidence}%` : '—'}</span>
              </div>
            </div>

            {agent.executionTimeMs > 0 && (
              <span className="text-[10px] text-[#8A8886] font-mono text-right">
                Runtime: {(agent.executionTimeMs / 1000).toFixed(2)}s
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
