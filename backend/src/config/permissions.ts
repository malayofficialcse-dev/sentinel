import { RoleName } from "@prisma/client";

export enum Permission {
  USER_CREATE = "USER_CREATE",
  USER_READ = "USER_READ",
  USER_UPDATE = "USER_UPDATE",
  USER_DELETE = "USER_DELETE",
  USER_READ_SELF = "USER_READ_SELF",
  USER_UPDATE_SELF = "USER_UPDATE_SELF",
  CASE_CREATE = "CASE_CREATE",
  CASE_READ = "CASE_READ",
  CASE_UPDATE = "CASE_UPDATE",
  CASE_DELETE = "CASE_DELETE",
  EVIDENCE_CREATE = "EVIDENCE_CREATE",
  EVIDENCE_READ = "EVIDENCE_READ",
  INVESTIGATION_RUN = "INVESTIGATION_RUN",
  INVESTIGATION_READ = "INVESTIGATION_READ",
  MODEL_RUN = "MODEL_RUN",
  MODEL_READ = "MODEL_READ",
  REPORT_CREATE = "REPORT_CREATE",
  REPORT_READ = "REPORT_READ",
  REPORT_UPDATE = "REPORT_UPDATE",
  AUDIT_LOG_READ = "AUDIT_LOG_READ",
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN"
}

export const rolePermissions: Record<RoleName, Permission[]> = {
  [RoleName.SUPER_ADMIN]: Object.values(Permission),
  [RoleName.HEAD]: [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.CASE_CREATE,
    Permission.CASE_READ,
    Permission.CASE_UPDATE,
    Permission.CASE_DELETE,
    Permission.EVIDENCE_CREATE,
    Permission.EVIDENCE_READ,
    Permission.INVESTIGATION_RUN,
    Permission.INVESTIGATION_READ,
    Permission.MODEL_RUN,
    Permission.MODEL_READ,
    Permission.REPORT_CREATE,
    Permission.REPORT_READ,
    Permission.REPORT_UPDATE,
    Permission.AUDIT_LOG_READ
  ],
  [RoleName.INVESTIGATOR]: [
    Permission.CASE_CREATE,
    Permission.CASE_READ,
    Permission.CASE_UPDATE,
    Permission.EVIDENCE_CREATE,
    Permission.EVIDENCE_READ,
    Permission.INVESTIGATION_RUN,
    Permission.INVESTIGATION_READ,
    Permission.MODEL_RUN,
    Permission.MODEL_READ,
    Permission.REPORT_CREATE,
    Permission.REPORT_READ,
    Permission.REPORT_UPDATE,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF
  ],
  [RoleName.ANALYST]: [
    Permission.CASE_READ,
    Permission.EVIDENCE_READ,
    Permission.INVESTIGATION_READ,
    Permission.MODEL_READ,
    Permission.REPORT_READ,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF
  ],
  [RoleName.REPORTER]: [
    Permission.EVIDENCE_CREATE,
    Permission.EVIDENCE_READ,
    Permission.REPORT_CREATE,
    Permission.REPORT_READ,
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF
  ],
  [RoleName.VIEWER]: [
    Permission.USER_READ_SELF,
    Permission.USER_UPDATE_SELF,
    Permission.CASE_READ,
    Permission.EVIDENCE_READ,
    Permission.REPORT_READ,
    Permission.INVESTIGATION_READ
  ]
};

export function hasPermission(role: RoleName, permission: Permission): boolean {
  if (role === RoleName.SUPER_ADMIN) return true;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: RoleName, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}
