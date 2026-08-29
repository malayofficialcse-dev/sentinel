import React from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const SystemSettings: React.FC = () => {
  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto text-left max-w-4xl">
      <div>
        <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
          System Configuration & AI Engine Parameters
        </h1>
        <p className="text-[13px] text-[#605E5C]">
          Configure threat intelligence ingestion thresholds, NLP models, and API keys.
        </p>
      </div>

      {/* Setting Section 1: AI Parameters */}
      <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-5 flex flex-col gap-4 shadow-xs">
        <h3 className="text-[14px] font-bold text-[#242424] border-b border-[#E1DFDD] pb-2">
          AI Risk Thresholds
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="High Risk Alert Threshold (0-100)" defaultValue="85" type="number" />
          <Input label="Medium Risk Alert Threshold (0-100)" defaultValue="50" type="number" />
          <Input label="Auto-Escalate Severity Score" defaultValue="90" type="number" />
          <Input label="Minimum Entity Correlation Confidence (%)" defaultValue="75" type="number" />
        </div>
      </div>

      {/* Setting Section 2: External Threat Feeds */}
      <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-5 flex flex-col gap-4 shadow-xs">
        <h3 className="text-[14px] font-bold text-[#242424] border-b border-[#E1DFDD] pb-2">
          External Threat Intel Feeds
        </h3>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-[13px] text-[#242424] cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded-[2px] text-[#0078D4]" />
            <span>National Cyber Crime Threat Exchange (NCCTX) Sync</span>
          </label>
          <label className="flex items-center gap-2 text-[13px] text-[#242424] cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded-[2px] text-[#0078D4]" />
            <span>RBI Fraud Registry Feed Integration</span>
          </label>
          <label className="flex items-center gap-2 text-[13px] text-[#242424] cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded-[2px] text-[#0078D4]" />
            <span>OpenPhish & VirusTotal Live Lookup</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" size="md">Reset Defaults</Button>
        <Button variant="primary" size="md">Save Changes</Button>
      </div>
    </div>
  );
};
