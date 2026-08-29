import { UserRole, Permission } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.REPORTER]: [
    Permission.SUBMIT_REPORT,
    Permission.VIEW_OWN_REPORTS,
  ],
  [UserRole.INVESTIGATOR]: [
    Permission.VIEW_ALL_CASES,
    Permission.MANAGE_CASES,
    Permission.VIEW_EVIDENCE,
    Permission.MANAGE_EVIDENCE,
    Permission.VIEW_ENTITIES,
    Permission.VIEW_GRAPH,
    Permission.VIEW_THREAT_INTEL,
    Permission.VIEW_FINANCIAL,
    Permission.VIEW_FINDINGS,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_REPORTS,
    Permission.VIEW_AI_AGENTS,
    Permission.VIEW_TIMELINE,
  ],
  [UserRole.ANALYST]: [
    Permission.VIEW_ALL_CASES,
    Permission.VIEW_EVIDENCE,
    Permission.VIEW_ENTITIES,
    Permission.VIEW_GRAPH,
    Permission.VIEW_THREAT_INTEL,
    Permission.VIEW_FINANCIAL,
    Permission.VIEW_FINDINGS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_TIMELINE,
  ],
  [UserRole.REVIEWER]: [
    Permission.VIEW_ALL_CASES,
    Permission.VIEW_EVIDENCE,
    Permission.VIEW_FINDINGS,
    Permission.REVIEW_FINDINGS,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_REPORTS,
  ],
  [UserRole.AUDITOR]: [
    Permission.VIEW_AUDIT_LOGS,
    Permission.VIEW_ALL_CASES,
    Permission.VIEW_REPORTS,
  ],
  [UserRole.ADMIN]: Object.values(Permission),
};

export const hasRolePermission = (role: UserRole, permission: Permission): boolean => {
  if (role === UserRole.ADMIN) return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case UserRole.INVESTIGATOR:
      return 'Lead Investigator';
    case UserRole.ANALYST:
      return 'Intelligence Analyst';
    case UserRole.REVIEWER:
      return 'Case Reviewer';
    case UserRole.AUDITOR:
      return 'Compliance Auditor';
    case UserRole.ADMIN:
      return 'System Administrator';
    case UserRole.REPORTER:
      return 'Citizen Reporter';
    default:
      return role;
  }
};
