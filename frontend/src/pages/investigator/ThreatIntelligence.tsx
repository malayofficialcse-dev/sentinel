import React, { useState } from 'react';
import { mockThreatIntel } from '../../data/mockData';
import { DataTable, Column } from '../../components/ui/DataTable';
import { RiskBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { ThreatIntel } from '../../types';

export const ThreatIntelligence: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = mockThreatIntel.filter(
    (t) =>
      t.indicator.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: Column<ThreatIntel>[] = [
    {
      key: 'indicator',
      header: 'Threat Indicator',
      sortable: true,
      render: (t) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-[#242424]">{t.indicator}</span>
          <span className="text-[11px] text-[#605E5C] line-clamp-1">{t.description}</span>
        </div>
      ),
    },
    {
      key: 'indicatorType',
      header: 'Type',
      width: '100px',
      sortable: true,
      render: (t) => (
        <span className="bg-[#F3F2F1] text-[#242424] text-[11px] px-2 py-0.5 rounded-[4px] font-semibold">
          {t.indicatorType}
        </span>
      ),
    },
    {
      key: 'reputation',
      header: 'Reputation',
      width: '120px',
      sortable: true,
      render: (t) => <RiskBadge risk={t.reputation} size="sm" />,
    },
    {
      key: 'threatMatches',
      header: 'Threat Matches',
      sortable: true,
      width: '130px',
      render: (t) => (
        <span className="font-bold text-[12px] text-[#D13438] bg-[#FDE7E9] px-2 py-0.5 rounded-[4px]">
          {t.threatMatches} Hits
        </span>
      ),
    },
    {
      key: 'relatedCases',
      header: 'Cases',
      width: '100px',
      sortable: true,
      render: (t) => <span className="font-semibold text-[#0078D4]">{t.relatedCases}</span>,
    },
    {
      key: 'source',
      header: 'Source Feed',
      width: '140px',
      render: (t) => <span className="text-[12px] text-[#605E5C]">{t.source}</span>,
    },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto text-left">
      <div>
        <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
          Threat Intelligence & External Feeds
        </h1>
        <p className="text-[13px] text-[#605E5C]">
          Domain reputation, proxy detections, malicious email senders, and known fraud syndicates.
        </p>
      </div>

      <div className="flex items-center justify-between bg-white p-3 border border-[#E1DFDD] rounded-[4px]">
        <div className="w-80">
          <Input
            placeholder="Search indicator or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<span className="material-symbols-outlined text-[16px]">search</span>}
          />
        </div>
        <span className="text-[12px] text-[#605E5C] font-mono">{filtered.length} Indicators Active</span>
      </div>

      <DataTable columns={columns} data={filtered} keyField="id" />
    </div>
  );
};
