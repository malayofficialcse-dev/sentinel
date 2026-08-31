import React, { useEffect, useState } from 'react';
import { auditApi } from '../../services/auditApi';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Input } from '../../components/ui/Input';
import { AuditLog } from '../../types';

export const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    auditApi.getAuditLogs()
      .then((data) => { if (mounted) setLogs(data); })
      .catch((err) => { if (mounted) setError(err instanceof Error ? err.message : 'Unable to load audit logs.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = logs.filter(
    (a) =>
      (a.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      a.action.toLowerCase().includes(search.toLowerCase()) ||
      (a.resourceId || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp (UTC)',
      sortable: true,
      width: '160px',
      render: (a) => (
        <span className="font-mono text-[12px] text-[#605E5C]">
          {new Date(a.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
        </span>
      ),
    },
    {
      key: 'userName',
      header: 'Actor / User',
      sortable: true,
      width: '140px',
      render: (a) => <span className="font-semibold text-[#242424]">{a.userName}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      width: '180px',
      render: (a) => (
        <span className="font-mono text-[11px] font-bold bg-[#F3F2F1] text-[#242424] px-2 py-0.5 rounded-[4px]">
          {a.action}
        </span>
      ),
    },
    {
      key: 'resource',
      header: 'Resource',
      render: (a) => (
        <span className="text-[12px] text-[#605E5C]">
          {a.resource}: <strong className="text-[#0078D4] font-mono">{a.resourceId}</strong>
        </span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP / Session',
      width: '160px',
      render: (a) => (
        <span className="font-mono text-[11px] text-[#8A8886]">
          {a.ipAddress} • {a.sessionId}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto text-left">
      <div>
        <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
          Immutable Audit Trail & Compliance Log
        </h1>
        <p className="text-[13px] text-[#605E5C]">
          Tamper-evident record of all evidence inspections, reviewer decisions, and case modifications.
        </p>
      </div>

      {error && (
        <div className="bg-[#FDE7E9] border border-[#E6A6AA] rounded-[4px] p-3 text-[#A4262C] text-[13px]">{error}</div>
      )}

      <div className="flex items-center justify-between bg-white p-3 border border-[#E1DFDD] rounded-[4px]">
        <div className="w-80">
          <Input
            placeholder="Search actor, action, or case ref…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<span className="material-symbols-outlined text-[16px]">search</span>}
          />
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[#107C10] font-semibold bg-[#F1FAF1] border border-[#A7D7A7] px-2.5 py-1 rounded-[4px]">
          <span className="material-symbols-outlined text-[16px]">lock</span>
          <span>Read-Only Cryptographic Log (Auditor Accessible)</span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">hourglass_top</span>
          Loading audit logs…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">history</span>
          {logs.length === 0
            ? 'No audit log entries recorded yet. Audit logging will be populated as actions are performed.'
            : 'No entries match the current search.'}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} keyField="id" />
      )}
    </div>
  );
};
