import React, { useEffect, useState } from 'react';
import { threatApi } from '../../services/threatApi';
import { DataTable, Column } from '../../components/ui/DataTable';
import { RiskBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { ThreatIntel } from '../../types';

export const ThreatIntelligence: React.FC = () => {
  const [threatList, setThreatList] = useState<ThreatIntel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    threatApi.getThreatIntel()
      .then((data) => { if (mounted) setThreatList(data); })
      .catch((err) => { if (mounted) setError(err instanceof Error ? err.message : 'Unable to load threat intelligence feed.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = threatList.filter(
    (t) =>
      t.indicator.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
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
          Domain reputation, proxy detections, malicious IOCs, and known threat feeds.
        </p>
      </div>

      {error && (
        <div className="bg-[#FDE7E9] border border-[#E6A6AA] rounded-[4px] p-3 text-[#A4262C] text-[13px]">{error}</div>
      )}

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

      {loading ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">hourglass_top</span>
          Loading threat intelligence feeds…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">security</span>
          {threatList.length === 0
            ? 'No external threat intelligence feeds are currently configured.'
            : 'No indicators match your search query.'}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} keyField="id" />
      )}
    </div>
  );
};
