import React, { useEffect, useState } from 'react';
import { entityApi } from '../../services/entityApi';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { Entity, EntityType } from '../../types';

export const EntityList: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    entityApi.getEntities()
      .then((data) => { if (mounted) { setEntities(data); } })
      .catch((err) => { if (mounted) setError(err instanceof Error ? err.message : 'Unable to load entities. Verify the backend is running.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = entities.filter((e) => {
    const matchesSearch =
      e.value.toLowerCase().includes(search.toLowerCase()) ||
      e.displayName.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || e.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const columns: Column<Entity>[] = [
    {
      key: 'value',
      header: 'Entity Value',
      sortable: true,
      render: (e) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-[#242424]">{e.value}</span>
          <span className="text-[11px] text-[#605E5C]">{e.displayName}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      width: '140px',
      sortable: true,
      render: (e) => (
        <span className="font-semibold text-[11px] bg-[#F3F2F1] text-[#323130] px-2 py-0.5 rounded-[4px]">
          {e.type}
        </span>
      ),
    },
    {
      key: 'riskScore',
      header: 'Risk Score',
      sortable: true,
      width: '110px',
      render: (e) => (
        <span
          className={`font-bold text-[12px] px-2 py-0.5 rounded-[4px] ${
            e.riskScore >= 80
              ? 'bg-[#FDE7E9] text-[#D13438]'
              : e.riskScore >= 50
                ? 'bg-[#FFF4CE] text-[#CA5010]'
                : 'bg-[#F1FAF1] text-[#107C10]'
          }`}
        >
          {e.riskScore}%
        </span>
      ),
    },
    {
      key: 'lastSeen',
      header: 'Last Seen',
      sortable: true,
      width: '130px',
      render: (e) => (
        <span className="text-[12px] text-[#605E5C]">
          {new Date(e.lastSeen).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            Entity Management & Intelligence Correlation
          </h1>
          <p className="text-[13px] text-[#605E5C]">
            Extracted UPI IDs, phone numbers, domains, IP addresses, and bank accounts from uploaded evidence.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#FDE7E9] border border-[#E6A6AA] rounded-[4px] p-3 text-[#A4262C] text-[13px]">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-[#E1DFDD] rounded-[4px]">
        <div className="w-80">
          <Input
            placeholder="Search entity value…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<span className="material-symbols-outlined text-[16px]">search</span>}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[#605E5C] font-semibold">Filter Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-8 px-2 text-[12px] bg-white border border-[#E1DFDD] rounded-[4px]"
          >
            <option value="ALL">All Entity Types</option>
            {Object.values(EntityType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">hourglass_top</span>
          Loading entities…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">fingerprint</span>
          {entities.length === 0
            ? 'No entities extracted yet. Upload evidence to a case to extract entities.'
            : 'No entities match the current filter.'}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} keyField="id" />
      )}
    </div>
  );
};
