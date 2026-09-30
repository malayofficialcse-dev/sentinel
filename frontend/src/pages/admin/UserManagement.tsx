import React, { useEffect, useState } from 'react';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { User, UserRole, Permission } from '../../types';
import { apiClient } from '../../services/api';
import { ROLE_PERMISSIONS, getRoleDisplayName } from '../../permissions/roles';
import { useAuthStore } from '../../store/authStore';

export const UserManagement: React.FC = () => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.INVESTIGATOR);
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(ROLE_PERMISSIONS[UserRole.INVESTIGATOR]);
  const setRolePermissions = useAuthStore((state) => state.setRolePermissions);

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

  const togglePermission = (permission: Permission) => {
    setSelectedPermissions((current) => current.includes(permission)
      ? current.filter((item) => item !== permission)
      : [...current, permission]);
  };

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    setSelectedPermissions(ROLE_PERMISSIONS[role] || []);
  };

  const permissionGroups = [
    {
      title: 'Module access',
      items: [
        Permission.SUBMIT_REPORT, Permission.VIEW_OWN_REPORTS, Permission.VIEW_ALL_CASES,
        Permission.VIEW_EVIDENCE, Permission.VIEW_ENTITIES, Permission.VIEW_GRAPH,
        Permission.VIEW_THREAT_INTEL, Permission.VIEW_FINANCIAL, Permission.VIEW_FINDINGS,
        Permission.VIEW_REPORTS, Permission.VIEW_AI_AGENTS, Permission.VIEW_AUDIT_LOGS,
        Permission.INVESTIGATION_RUN, Permission.MODEL_READ, Permission.MODEL_RUN,
      ],
    },
    {
      title: 'Case actions',
      items: [Permission.CREATE_CASE, Permission.UPDATE_CASE, Permission.DELETE_CASE, Permission.MANAGE_CASES],
    },
    {
      title: 'Evidence and report actions',
      items: [
        Permission.CREATE_EVIDENCE, Permission.UPDATE_EVIDENCE, Permission.DELETE_EVIDENCE,
        Permission.MANAGE_EVIDENCE, Permission.CREATE_REPORT, Permission.UPDATE_REPORT, Permission.DELETE_REPORT,
        Permission.GENERATE_REPORTS,
      ],
    },
    {
      title: 'Administration',
      items: [Permission.MANAGE_USERS, Permission.MANAGE_ROLES, Permission.MANAGE_SYSTEM, Permission.REVIEW_FINDINGS],
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

      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-[15px] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--primary)]">admin_panel_settings</span>
              Module Access & Actions
            </h2>
            <p className="text-[12px] text-[var(--text-secondary)] mt-1">
              Choose what each role can see and which Create, Edit, or Delete actions it can perform.
            </p>
          </div>
          <select
            value={selectedRole}
            onChange={(event) => selectRole(event.target.value as UserRole)}
            className="h-9 px-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-[4px] text-[12px] font-semibold text-[var(--text-primary)]"
          >
            {Object.values(UserRole).map((role) => <option key={role} value={role}>{getRoleDisplayName(role)}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-4">
          {permissionGroups.map((group) => (
            <div key={group.title} className="rounded-[5px] border border-[var(--border)] bg-[var(--surface-secondary)] p-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">{group.title}</h3>
              <div className="space-y-2">
                {group.items.map((permission) => (
                  <label key={permission} className="flex items-start gap-2 text-[12px] text-[var(--text-primary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                      className="mt-0.5 accent-[var(--primary)]"
                    />
                    <span>{permission.replaceAll('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[var(--border)]">
          <p className="text-[11px] text-[var(--text-muted)]">
            Policy for <span className="font-semibold text-[var(--text-secondary)]">{getRoleDisplayName(selectedRole)}</span>: {selectedPermissions.length} permissions enabled.
          </p>
          <Button variant="primary" size="sm" onClick={() => setRolePermissions(selectedRole, selectedPermissions)}>
            Save Access Policy
          </Button>
        </div>
      </section>

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
