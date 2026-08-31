import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { modelApi, ModelInfo } from '../../services/modelApi';
import { Button } from '../../components/ui/Button';

export const AIModelsHub: React.FC = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await modelApi.getModelsInfo();
        setModels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Unable to load AI model metadata.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const getRouteForModel = (id: string) => {
    if (id.includes('phishing')) return '/investigator/models/phishing';
    if (id.includes('financial')) return '/investigator/models/financial';
    if (id.includes('malware')) return '/investigator/models/malware';
    return '/investigator/models';
  };

  const getIconForModel = (id: string) => {
    if (id.includes('phishing')) return '🔗';
    if (id.includes('financial')) return '💳';
    if (id.includes('malware')) return '🛡️';
    return '🤖';
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
          Sentinel AI Model Hub
        </h1>
        <p className="text-[13px] text-[#605E5C]">
          Direct testing and diagnostic console for all 3 specialized Sentinel machine learning models.
        </p>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-[#605E5C]">Loading model parameters...</div>
        ) : error ? (
          <div className="col-span-3 text-center py-12 text-[#A4262C]">
            {error} Please verify that the Node API and AI service are running.
          </div>
        ) : models.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-[#605E5C]">No AI models are currently available.</div>
        ) : (
          (Array.isArray(models) ? models : []).map((model) => (
            <div
              key={model.id}
              className="bg-white border border-[#E1DFDD] rounded-[8px] p-6 flex flex-col justify-between shadow-xs hover:border-[#0078D4] hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[28px]">{getIconForModel(model.id)}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#F1FAF1] text-[#107C10] border border-[#A7D7A7] uppercase tracking-wider">
                    {model.status}
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-[#0078D4] uppercase tracking-wider block mb-1">
                  {model.category}
                </span>
                <h3 className="font-bold text-[17px] text-[#242424] mb-2 group-hover:text-[#0078D4] transition-colors">
                  {model.name}
                </h3>
                <p className="text-[12px] text-[#605E5C] leading-relaxed mb-4">
                  {model.description}
                </p>

                {/* Specs */}
                <div className="bg-[#FAFAFA] border border-[#E1DFDD] rounded-[6px] p-3 flex flex-col gap-2 text-[12px] mb-5">
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">Algorithm:</span>
                    <span className="font-semibold text-[#242424] text-right truncate max-w-[170px]" title={model.algorithm}>
                      {model.algorithm}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">Accuracy:</span>
                    <span className="font-bold text-[#107C10]">
                      {typeof model.accuracy === 'number' ? `${(model.accuracy * 100).toFixed(2)}%` : 'Not available'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#605E5C]">Input Dimension:</span>
                    <span className="font-mono text-[#242424]">{model.input_type}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => navigate(getRouteForModel(model.id))}
                className="w-full justify-center"
              >
                Launch Model Sandbox →
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Integration Details Banner */}
      <div className="bg-[#EFF6FC] border border-[#B4D6F0] rounded-[8px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-[14px] text-[#0078D4]">Unified AI Engine Execution</h4>
          <p className="text-[12px] text-[#242424] mt-0.5">
            These 3 models run both as standalone diagnostic sandboxes above, and autonomously inside the Sentinel Evidence Pipeline whenever a citizen submits a screenshot or transaction report.
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/investigator/agents')} className="whitespace-nowrap">
          View Agent Pipeline
        </Button>
      </div>
    </div>
  );
};
