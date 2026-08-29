import React from 'react';
import { Card } from '../../components/ui/Card';

const services = [
  ['Frontend workspace', 'Operational'],
  ['Investigation API', 'Demo mode'],
  ['AI analysis workers', 'Demo mode'],
  ['Evidence integrity ledger', 'Operational'],
];

export const SystemStatus: React.FC = () => (
  <div className="flex-1 p-6 overflow-y-auto text-left">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-[22px] font-bold text-[#242424]">System Status</h1>
      <p className="text-[13px] text-[#605E5C] mt-1">Current availability of the SENTINEL demo services.</p>
      <Card className="p-4 mt-6">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E1DFDD]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#107C10]" />
          <span className="text-[13px] font-bold text-[#242424]">All systems available</span>
        </div>
        <div className="divide-y divide-[#E1DFDD]">
          {services.map(([service, status]) => (
            <div key={service} className="flex items-center justify-between py-3 text-[12px]">
              <span className="text-[#323130]">{service}</span>
              <span className={status === 'Operational' ? 'text-[#107C10] font-semibold' : 'text-[#605E5C] font-semibold'}>{status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);
