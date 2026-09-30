import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { modelApi, ModelInfo } from '../../services/modelApi';
import { caseApi } from '../../services/caseApi';

export const SystemStatus: React.FC = () => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [apiReady, setApiReady] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([modelApi.getModelsInfo(), caseApi.getCases()])
      .then(([modelInfo]) => {
        if (!mounted) return;
        setModels(modelInfo);
        setApiReady(true);
      })
      .catch(() => { if (mounted) setApiReady(false); });
    return () => { mounted = false; };
  }, []);

  const services = [
    ['Investigation API', apiReady === null ? 'Checking' : apiReady ? 'Operational' : 'Unavailable'],
    ['AI analysis workers', models.length > 0 && models.every((model) => model.status === 'ACTIVE') ? 'Operational' : 'Unavailable'],
    ['Evidence integrity ledger', apiReady ? 'Operational' : 'Unavailable'],
  ];
  const allReady = services.every(([, status]) => status === 'Operational');

  return (
    <div className="flex-1 p-6 overflow-y-auto text-left">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[22px] font-bold text-[#242424]">System Status</h1>
        <p className="text-[13px] text-[#605E5C] mt-1">Live availability of the SENTINEL services and model artifacts.</p>
        <Card className="p-4 mt-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E1DFDD]">
            <span className={`w-2.5 h-2.5 rounded-full ${allReady ? 'bg-[#107C10]' : 'bg-[#CA5010]'}`} />
            <span className="text-[13px] font-bold text-[#242424]">{allReady ? 'All systems available' : 'Service attention required'}</span>
          </div>
          <div className="divide-y divide-[#E1DFDD]">
            {services.map(([service, status]) => (
              <div key={service} className="flex items-center justify-between py-3 text-[12px]">
                <span className="text-[#323130]">{service}</span>
                <span className={status === 'Operational' ? 'text-[#107C10] font-semibold' : 'text-[#CA5010] font-semibold'}>{status}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4 mt-4">
          <h2 className="text-[13px] font-bold text-[#242424] mb-2">Loaded Model Artifacts</h2>
          <div className="divide-y divide-[#E1DFDD]">
            {models.map((model) => (
              <div key={model.id} className="flex items-center justify-between py-2 text-[12px]">
                <span className="text-[#323130]">{model.id}</span>
                <span className={model.status === 'ACTIVE' ? 'text-[#107C10] font-semibold' : 'text-[#CA5010] font-semibold'}>{model.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
