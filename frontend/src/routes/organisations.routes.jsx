// src/routes/organisations.routes.jsx
import React from "react";
import { ROUTES } from "../config/constants";
// Lazy load organisation pages (adjust paths to match your actual files)
const OrganisationDashboardPage = React.lazy(() => import('../pages/organisations/OrganisationDashboardPage'));
const OrganisationSettingsPage = React.lazy(() => import('../pages/organisations/OrganisationSettingsPage'));
const OrganisationAdminPage = React.lazy(() => import('../pages/organisations/OrganisationAdminPage'));
const OrganisationAuditPage = React.lazy(() => import('../pages/organisations/OrganisationAuditPage'));
const OrganisationBrandingPage = React.lazy(() => import('../pages/organisations/OrganisationBrandingPage'));
const OrganisationUsersPage = React.lazy(() => import('../pages/organisations/OrganisationUsersPage'));
const OrganisationSubscriptionPage = React.lazy(() => import('../pages/organisations/OrganisationSubscriptionPage'));
const OrganisationReportsPage = React.lazy(() => import('../pages/organisations/OrganisationReportsPage'));
const OrganisationDepartmentsPage = React.lazy(() => import('../pages/organisations/OrganisationDepartmentsPage'));
const OrganisationTeamsPage = React.lazy(() => import('../pages/organisations/OrganisationTeamsPage'));
const OrganisationPositionsPage = React.lazy(() => import('../pages/organisations/OrganisationPositionsPage'));
const OrganisationDomainsPage = React.lazy(() => import('../pages/organisations/OrganisationDomainsPage'));
const OrganisationContactsPage = React.lazy(() => import('../pages/organisations/OrganisationContactsPage'));
const OrganisationWorkflowsPage = React.lazy(() => import('../pages/organisations/OrganisationWorkflowsPage'));
const OrganisationImportPage = React.lazy(() => import('../pages/organisations/OrganisationImportPage'));
const OrganisationExportPage = React.lazy(() => import('../pages/organisations/OrganisationExportPage'));
const OrganisationApiTokensPage = React.lazy(() => import('../pages/organisations/OrganisationApiTokensPage'));
const OrganisationTwoFactorPage = React.lazy(() => import('../pages/organisations/OrganisationTwoFactorPage'));
const OrganisationProfilePage = React.lazy(() => import('../pages/organisations/OrganisationProfilePage'));
const OrganisationHierarchyPage = React.lazy(() => import('../pages/organisations/OrganisationHierarchyPage'));
const OrganisationFeatureFlagsPage = React.lazy(() => import('../pages/organisations/OrganisationFeatureFlagsPage'));
const OrganisationPlansPage = React.lazy(() => import('../pages/organisations/OrganisationPlansPage'));
const organisationsRoutes = [
    { path: ROUTES.ORGANISATION_DASHBOARD, element: <OrganisationDashboardPage /> },
    { path: ROUTES.ORGANISATION_SETTINGS, element: <OrganisationSettingsPage /> },
    { path: ROUTES.ORGANISATION_ADMIN, element: <OrganisationAdminPage /> },
    { path: ROUTES.ORGANISATION_AUDIT, element: <OrganisationAuditPage /> },
    { path: ROUTES.ORGANISATION_BRANDING, element: <OrganisationBrandingPage /> },
    { path: ROUTES.ORGANISATION_USERS, element: <OrganisationUsersPage /> },
    { path: ROUTES.ORGANISATION_SUBSCRIPTION, element: <OrganisationSubscriptionPage /> },
    { path: ROUTES.ORGANISATION_REPORTS, element: <OrganisationReportsPage /> },
    { path: ROUTES.ORGANISATION_DEPARTMENTS, element: <OrganisationDepartmentsPage /> },
    { path: ROUTES.ORGANISATION_TEAMS, element: <OrganisationTeamsPage /> },
    { path: ROUTES.ORGANISATION_POSITIONS, element: <OrganisationPositionsPage /> },
    { path: ROUTES.ORGANISATION_DOMAINS, element: <OrganisationDomainsPage /> },
    { path: ROUTES.ORGANISATION_CONTACTS, element: <OrganisationContactsPage /> },
    { path: ROUTES.ORGANISATION_WORKFLOWS, element: <OrganisationWorkflowsPage /> },
    { path: ROUTES.ORGANISATION_IMPORT, element: <OrganisationImportPage /> },
    { path: ROUTES.ORGANISATION_EXPORT, element: <OrganisationExportPage /> },
    { path: ROUTES.ORGANISATION_API_TOKENS, element: <OrganisationApiTokensPage /> },
    { path: ROUTES.ORGANISATION_TWO_FACTOR, element: <OrganisationTwoFactorPage /> },
    { path: ROUTES.ORGANISATION_PROFILE, element: <OrganisationProfilePage /> },
    { path: ROUTES.ORGANISATION_HIERARCHY, element: <OrganisationHierarchyPage /> },
    { path: ROUTES.ORGANISATION_FEATURE_FLAGS, element: <OrganisationFeatureFlagsPage /> },
    { path: ROUTES.ORGANISATION_PLANS, element: <OrganisationPlansPage /> },
];
export default organisationsRoutes;