import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseApi } from '../../services/caseApi';
import { DataTable, Column } from '../../components/ui/DataTable';
import { SeverityBadge, CaseStatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Case, Severity, CaseStatus } from '../../types';

export const CaseList: React.FC = () => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cases, setCases] = useState<Case[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    caseApi.getCases().then(setCases).catch((err) => setError(err instanceof Error ? err.message : 'Backend unavailable'));
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesSeverity = severityFilter === 'ALL' || c.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const columns: Column<Case>[] = [
    {
      key: 'id',
      header: 'Case ID',
      sortable: true,
      width: '120px',
      render: (c) => <span className="font-mono font-medium text-[#0078D4]">{c.id}</span>,
    },
    {
      key: 'title',
      header: 'Case Title',
      sortable: true,
      render: (c) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[#242424]">{c.title}</span>
          <span className="text-[11px] text-[#605E5C] line-clamp-1">{c.description}</span>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      width: '110px',
      render: (c) => <SeverityBadge severity={c.severity} size="sm" />,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '130px',
      render: (c) => <CaseStatusBadge status={c.status} size="sm" />,
    },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-[2px] bg-[#E1DFDD] overflow-hidden text-[10px] flex items-center justify-center font-bold">
            {c.assignedTo?.avatar ? (
              <img src={c.assignedTo.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              'U'
            )}
          </div>
          <span className="text-[12px]">{c.assignedTo?.name || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      width: '120px',
      render: (c) => (
        <span className="text-[12px] text-[#605E5C]">
          {new Date(c.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      width: '100px',
      render: (c) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/investigator/cases/${c.id}`)}>
          Inspect →
        </Button>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            Case Management
          </h1>
          <p className="text-[13px] text-[#605E5C]">
            Active fraud investigations, evidence correlation, and entity clusters.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          leftIcon={<span className="material-symbols-outlined text-[16px]">add</span>}
        >
          New Case
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-[#E1DFDD] rounded-[4px]">
        <div className="w-80">
          <Input
            placeholder="Search by ID, title, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<span className="material-symbols-outlined text-[16px]">search</span>}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#605E5C] font-semibold">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-8 px-2 text-[12px] bg-white border border-[#E1DFDD] rounded-[4px]"
            >
              <option value="ALL">All Severities</option>
              <option value={Severity.CRITICAL}>Critical</option>
              <option value={Severity.HIGH}>High</option>
              <option value={Severity.MEDIUM}>Medium</option>
              <option value={Severity.LOW}>Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-[#605E5C] font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 text-[12px] bg-white border border-[#E1DFDD] rounded-[4px]"
            >
              <option value="ALL">All Statuses</option>
              <option value={CaseStatus.INVESTIGATING}>Investigating</option>
              <option value={CaseStatus.UNDER_REVIEW}>Under Review</option>
              <option value={CaseStatus.ESCALATED}>Escalated</option>
              <option value={CaseStatus.OPEN}>Open</option>
              <option value={CaseStatus.RESOLVED}>Resolved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      {error && <div className="text-[#A4262C]">{error}</div>}
      <DataTable
        columns={columns}
        data={filteredCases}
        keyField="id"
        onRowClick={(c) => navigate(`/investigator/cases/${c.id}`)}
      />
    </div>
  );
};
