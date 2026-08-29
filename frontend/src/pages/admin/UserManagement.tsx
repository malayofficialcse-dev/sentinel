import React, { useState } from 'react';
import { mockUsers } from '../../data/mockData';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { User, UserRole } from '../../types';

export const UserManagement: React.FC = () => {
  const [usersList, setUsersList] = useState<User[]>(mockUsers);

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Full Name',
      sortable: true,
      render: (u) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[4px] bg-[#E1DFDD] overflow-hidden">
            {u.avatar ? (
              <img src={u.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[16px] text-[#605E5C] flex items-center justify-center h-full">
                person
              </span>
            )}
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
          {u.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      render: (u) => (
        <span className="text-[12px] text-[#605E5C]">
          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      align: 'right',
      width: '120px',
      render: (u) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setUsersList((prev) =>
              prev.map((item) =>
                item.id === u.id
                  ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
                  : item
              )
            );
          }}
        >
          {u.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
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
        <Button variant="primary" size="md" leftIcon={<span className="material-symbols-outlined text-[16px]">person_add</span>}>
          Add User
        </Button>
      </div>

      <DataTable columns={columns} data={usersList} keyField="id" />
    </div>
  );
};
