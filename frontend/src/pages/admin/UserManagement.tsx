import React, { useEffect, useState } from 'react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { User, UserRole, Permission } from '../../types';
import { apiClient } from '../../services/api';

export const UserManagement: React.FC = () => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    apiClient.get('/users')
      .then((res) => {
        if (mounted) {
          const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
          setUsersList(list);
        }
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Unable to load user accounts.');
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Full Name',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[4px] bg-[#E1DFDD] overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-[#605E5C]">person</span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-[#242424]">{u.name}</span>
            <span className="text-[11px] text-[#605E5C]">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      width: '160px',
      render: (u) => (
        <span className="font-mono text-[11px] font-bold bg-[#EFF6FC] text-[#0078D4] px-2 py-0.5 rounded-[4px]">
          {u.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      render: (u) => (
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-[4px] ${
            u.status === 'active'
              ? 'bg-[#F1FAF1] text-[#107C10] border border-[#A7D7A7]'
              : 'bg-[#F3F2F1] text-[#8A8886]'
          }`}
        >
          {u.status?.toUpperCase() || 'ACTIVE'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (u) => (
        <span className="text-[12px] text-[#605E5C]">
          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            User & Access Administration
          </h1>
          <p className="text-[13px] text-[#605E5C]">
            Manage authorized investigators, intelligence analysts, and reviewer accounts.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-[#FDE7E9] border border-[#E6A6AA] rounded-[4px] p-3 text-[#A4262C] text-[13px]">{error}</div>
      )}

      {loading ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">hourglass_top</span>
          Loading user accounts…
        </div>
      ) : usersList.length === 0 ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">manage_accounts</span>
          No user accounts configured in database. User authentication is running in development system mode.
        </div>
      ) : (
        <DataTable columns={columns} data={usersList} keyField="id" />
      )}
    </div>
  );
};
