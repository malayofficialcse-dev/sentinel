import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { modelApi, ModelInfo } from '../../services/modelApi';
import { Button } from '../../components/ui/Button';

export const AIAgents: React.FC = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    modelApi.getModelsInfo()
      .then((data) => { if (mounted) { setModels(data); setError(null); } })
      .catch((err) => { if (mounted) setError(err instanceof Error ? err.message : 'AI service unavailable.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1DFDD] pb-4">
        <div>
          <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            AI Model Status & Agent Overview
          </h1>
          <p className="text-[13px] text-[#605E5C]">
            Real-time status of deployed ML models. All predictions flow through the Node.js backend.
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
              <span className="text-[11px] text-[#605E5C]">Structural & lexical feature extraction</span>
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
              <span className="text-[11px] text-[#605E5C]">PaySim Random Forest model</span>
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
              <span className="text-[11px] text-[#605E5C]">Static analysis & IOC detection</span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[18px] text-[#605E5C] group-hover:text-[#0078D4]">chevron_right</span>
        </div>
      </div>

      {/* Model Status */}
      {loading ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[6px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">hourglass_top</span>
          Loading model status from AI service…
        </div>
      ) : error ? (
        <div className="bg-[#FFF4CE] border border-[#F4C7A1] rounded-[6px] p-6 text-[#CA5010]">
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            AI Service Unavailable
          </div>
          <p className="text-[13px]">{error}</p>
          <p className="text-[12px] mt-2 text-[#605E5C]">
            Start the Python AI service to see real model status.
          </p>
        </div>
      ) : models.length === 0 ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[6px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">model_training</span>
          No model metadata returned by the AI service.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <div
              key={model.id}
              className="bg-white border border-[#E1DFDD] rounded-[6px] p-5 flex flex-col gap-3 shadow-xs hover:border-[#0078D4] transition-colors"
            >
              <div className="flex items-center justify-between border-b border-[#E1DFDD] pb-3">
                <div className="flex flex-col">
                  <h3 className="font-bold text-[14px] text-[#242424]">{model.name || model.id}</h3>
                  <span className="text-[11px] font-mono text-[#605E5C]">{model.id}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-[4px] uppercase tracking-wider ${
                    model.status === 'loaded' || model.status === 'ready'
                      ? 'bg-[#F1FAF1] text-[#107C10] border border-[#A7D7A7]'
                      : model.status === 'loading'
                        ? 'bg-[#EFF6FC] text-[#0078D4] border border-[#B4D6F0] animate-pulse'
                        : 'bg-[#FFF4CE] text-[#CA5010] border border-[#F4C7A1]'
                  }`}
                >
                  {model.status}
                </span>
              </div>

              <p className="text-[12px] text-[#605E5C] leading-normal">{model.description || model.category || 'ML Model'}</p>

              <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#FAFAFA] border border-[#E1DFDD] rounded-[4px] text-center text-[11px]">
                {model.accuracy !== undefined && (
                  <div>
                    <span className="text-[#605E5C] block">Accuracy</span>
                    <span className="font-bold text-[#242424]">
                      {typeof model.accuracy === 'number' ? `${(model.accuracy * 100).toFixed(1)}%` : model.accuracy}
                    </span>
                  </div>
                )}
                {model.features_count !== undefined && (
                  <div>
                    <span className="text-[#605E5C] block">Features</span>
                    <span className="font-bold text-[#242424]">{model.features_count}</span>
                  </div>
                )}
                {model.algorithm && (
                  <div className="col-span-2">
                    <span className="text-[#605E5C] block">Algorithm</span>
                    <span className="font-bold text-[#242424]">{model.algorithm}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
