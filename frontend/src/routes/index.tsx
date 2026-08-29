import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { ReporterLayout } from '../layouts/ReporterLayout';
import { InvestigatorLayout } from '../layouts/InvestigatorLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Reporter Pages
import { ReporterDashboard } from '../pages/reporter/ReporterDashboard';
import { NewReport } from '../pages/reporter/NewReport';
import { AnalysisProgressPage } from '../pages/reporter/AnalysisProgressPage';
import { ReportResult } from '../pages/reporter/ReportResult';
import { MyReports } from '../pages/reporter/MyReports';

// Investigator Pages
import { InvestigatorDashboard } from '../pages/investigator/Dashboard';
import { CaseList } from '../pages/investigator/CaseList';
import { CaseDetail } from '../pages/investigator/CaseDetail';
import { EvidenceList } from '../pages/investigator/EvidenceList';
import { EntityList } from '../pages/investigator/EntityList';
import { GraphInvestigation } from '../pages/investigator/GraphInvestigation';
import { ThreatIntelligence } from '../pages/investigator/ThreatIntelligence';
import { FinancialAnalysis } from '../pages/investigator/FinancialAnalysis';
import { AIAgents } from '../pages/investigator/AIAgents';
import { Findings } from '../pages/investigator/Findings';
import { Reports } from '../pages/investigator/Reports';
import { AuditLogs } from '../pages/investigator/AuditLogs';

// Admin Pages
import { UserManagement } from '../pages/admin/UserManagement';
import { SystemSettings } from '../pages/admin/SystemSettings';

// Error Pages
import { NotFound } from '../pages/NotFound';
import { PermissionDenied } from '../pages/PermissionDenied';
import { ProtectedRoute } from '../permissions/ProtectedRoute';
import { UserRole } from '../types';

export const router = createBrowserRouter([
  // Public Portal
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },

  // Reporter / Citizen Portal
  {
    path: '/',
    element: <ReporterLayout />,
    children: [
      { path: 'reporter', element: <ReporterDashboard /> },
      { path: 'report', element: <NewReport /> },
      { path: 'report/progress', element: <AnalysisProgressPage /> },
      { path: 'reports', element: <MyReports /> },
      { path: 'reports/:id', element: <ReportResult /> },
    ],
  },

  // Investigator / Analyst Portal
  {
    path: '/investigator',
    element: (
      <ProtectedRoute allowedRoles={[UserRole.INVESTIGATOR, UserRole.ANALYST, UserRole.REVIEWER, UserRole.AUDITOR, UserRole.ADMIN]}>
        <InvestigatorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <InvestigatorDashboard /> },
      { path: 'cases', element: <CaseList /> },
      { path: 'cases/:id', element: <CaseDetail /> },
      { path: 'evidence', element: <EvidenceList /> },
      { path: 'entities', element: <EntityList /> },
      { path: 'graph', element: <GraphInvestigation /> },
      { path: 'threat-intelligence', element: <ThreatIntelligence /> },
      { path: 'financial', element: <FinancialAnalysis /> },
      { path: 'agents', element: <AIAgents /> },
      { path: 'findings', element: <Findings /> },
      { path: 'reports', element: <Reports /> },
      { path: 'audit', element: <AuditLogs /> },
    ],
  },

  // Admin Portal
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
        <InvestigatorLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/users" replace /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'settings', element: <SystemSettings /> },
    ],
  },

  // Error & Fallback Routes
  { path: '/permission-denied', element: <PermissionDenied /> },
  { path: '*', element: <NotFound /> },
]);
