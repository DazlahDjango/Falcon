import React, { useEffect, lazy, Suspense, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AuthProvider, useAuthContext } from './contexts/accounts/AuthContext';
import { TenantProvider } from './contexts/accounts/TenantContext';
import { PermissionProvider } from './contexts/accounts/PermissionContext';
import { ThemeProvider } from './contexts/accounts/ThemeContext';
import { NotificationProvider } from './contexts/accounts/NotificationContext';
import { OrganisationProvider } from './contexts/organisation/OrganisationContext';
import { MainLayout, AuthLayout } from './components/common/Layout';
import LoadingScreen from './components/common/Feedback/LoadingScreen';
import Alert from './components/common/UI/Alert';
import { ROUTES } from './config/constants';
import { usePermissions } from './hooks/accounts/usePermissions';
import { setupAxiosInterceptors } from './services/accounts/api/client';

// ============================================================
// ORGANISATION COMPONENTS (Lazy loaded)
// ============================================================
// Main
const OrganisationDashboard = lazy(() => import('./pages/organisation/OrganisationDashboardPage'));
const OrganisationSettings = lazy(() => import('./pages/organisation/OrganisationSettingsPage'));
const OrganisationAdmin = lazy(() => import('./pages/organisation/OrganisationAdminPage'));
const OrganisationAudit = lazy(() => import('./pages/organisation/OrganisationAuditPage'));
const OrganisationBranding = lazy(() => import('./pages/organisation/OrganisationBrandingPage'));
const OrganisationUsers = lazy(() => import('./pages/organisation/OrganisationUsersPage'));
const OrganisationSubscription = lazy(() => import('./pages/organisation/OrganisationSubscriptionPage'));
const OrganisationReports = lazy(() => import('./pages/organisation/OrganisationReportsPage'));

// Structure
const OrganisationDepartments = lazy(() => import('./pages/organisation/OrganisationDepartmentsPage'));
const OrganisationTeams = lazy(() => import('./pages/organisation/OrganisationTeamsPage'));
const OrganisationPositions = lazy(() => import('./pages/organisation/OrganisationPositionsPage'));

// Configuration & Security
const OrganisationDomains = lazy(() => import('./pages/organisation/OrganisationDomainsPage'));
const OrganisationContacts = lazy(() => import('./pages/organisation/OrganisationContactsPage'));
const OrganisationWorkflows = lazy(() => import('./pages/organisation/OrganisationWorkflowsPage'));
const OrganisationApiTokens = lazy(() => import('./pages/organisation/OrganisationApiTokensPage'));
const OrganisationTwoFactor = lazy(() => import('./pages/organisation/OrganisationTwoFactorPage'));

// Import/Export & Profile
const OrganisationImport = lazy(() => import('./pages/organisation/OrganisationImportPage'));
const OrganisationExport = lazy(() => import('./pages/organisation/OrganisationExportPage'));
const OrganisationProfile = lazy(() => import('./pages/organisation/OrganisationProfilePage'));

// ============================================================
// LAZY LOADED COMPONENTS (Accounts & Shared)
// ============================================================
// Public Pages
const Home = lazy(() => import('./pages/accounts/Home'));
const About = lazy(() => import('./pages/accounts/About'));
const Help = lazy(() => import('./pages/accounts/Help'));

// Auth Components
const Login = lazy(() => import('./components/accounts/auth/Login'));
const Register = lazy(() => import('./components/accounts/auth/Register'));
const MFAVerify = lazy(() => import('./components/accounts/auth/MFAVerify'));
const MFASetup = lazy(() => import('./components/accounts/auth/MFASetup'));
const ForgotPassword = lazy(() => import('./components/accounts/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/accounts/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./components/accounts/auth/VerifyEmail'));
const AcceptInvitation = lazy(() => import('./components/accounts/auth/AcceptInvitation'));

// Dashboard
const Dashboard = lazy(() => import('./components/accounts/dashboard/Dashboard'));

// User Management
const UserList = lazy(() => import('./components/accounts/users/UserList'));
const UserDetail = lazy(() => import('./components/accounts/users/UserDetail'));
const UserCreate = lazy(() => import('./components/accounts/users/UserCreate'));
const UserEdit = lazy(() => import('./components/accounts/users/UserEdit'));
const UserProfile = lazy(() => import('./components/accounts/users/UserProfile'));

// Team Management
const TeamView = lazy(() => import('./components/accounts/team/TeamView'));

// Role Management
const RoleList = lazy(() => import('./components/accounts/roles/RoleList'));
const RoleDetail = lazy(() => import('./components/accounts/roles/RoleDetail'));
const RoleCreate = lazy(() => import('./components/accounts/roles/RoleCreate'));
const RoleEdit = lazy(() => import('./components/accounts/roles/RoleEdit'));

// Session Management
const SessionList = lazy(() => import('./components/accounts/sessions/SessionList'));

// Settings & Audit
const Settings = lazy(() => import('./components/accounts/settings/Settings'));
const AuditLogs = lazy(() => import('./components/accounts/audit/AuditLogs'));

// Admin Routes
const AdminDashboard = lazy(() => import('./components/accounts/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./components/accounts/admin/AdminUsers'));
const AdminTenants = lazy(() => import('./components/accounts/admin/AdminTenants'));
const AdminSystem = lazy(() => import('./components/accounts/admin/AdminSystem'));

// Error Pages
const NotFound = lazy(() => import('./pages/accounts/NotFound'));
const Unauthorized = lazy(() => import('./pages/accounts/Unauthorized'));
const ServerError = lazy(() => import('./pages/accounts/ServerError'));

// Setup axios interceptors
setupAxiosInterceptors();

// ============================================================
// Protected Route Component
// ============================================================
const ProtectedRoute = ({ children, requiredRoles = null, requiredPermissions = null }) => {
    const { isAuthenticated, isLoading, user } = useAuthContext();
    const { hasAnyRole, hasAnyPermission } = usePermissions();
    const location = useLocation();
    const hasRedirected = useRef(false);

    if (isLoading) {
        return <LoadingScreen fullScreen message="Checking authentication..." />;
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    if (requiredRoles && !hasAnyRole(requiredRoles)) {
        return <Navigate to="/unauthorized" replace />;
    }
    
    if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
        return <Navigate to="/unauthorized" replace />;
    }
    
    return children;
};

// ============================================================
// App Content Component
// ============================================================
const AppContent = () => {
    const { isAuthenticated, user } = useAuthContext();
    const location = useLocation();

    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            console.log('Page view:', location.pathname);
        }
    }, [location]);

    return (
        <Suspense fallback={<LoadingScreen fullScreen />}>
            <Routes>
                {/* ============================================================
                    PUBLIC ROUTES - No Layout
                ============================================================ */}
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route path={ROUTES.ABOUT} element={<About />} />
                <Route path={ROUTES.HELP} element={<Help />} />

                {/* ============================================================
                    AUTH ROUTES - AuthLayout
                ============================================================ */}
                <Route element={<AuthLayout />}>
                    <Route path={ROUTES.LOGIN} element={<Login />} />
                    <Route path={ROUTES.REGISTER} element={<Register />} />
                    <Route path={ROUTES.MFA_VERIFY} element={<MFAVerify />} />
                    <Route path={ROUTES.MFA_SETUP} element={<MFASetup />} />
                    <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
                    <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
                    <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
                    <Route path={ROUTES.ACCEPT_INVITATION} element={<AcceptInvitation />} />
                </Route>

                {/* ============================================================
                    PROTECTED ROUTES - MainLayout
                ============================================================ */}
                <Route element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    {/* Dashboard */}
                    <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                    
                    {/* User Management */}
                    <Route path={ROUTES.USERS} element={<UserList />} />
                    <Route path={ROUTES.USER_DETAIL} element={<UserDetail />} />
                    <Route path={ROUTES.USER_CREATE} element={<UserCreate />} />
                    <Route path={ROUTES.USER_EDIT} element={<UserEdit />} />
                    <Route path={ROUTES.USER_PROFILE} element={<UserProfile />} /> 
                    
                    {/* Team Management */}
                    <Route path={ROUTES.TEAM} element={<TeamView />} /> 
                    
                    {/* Role Management */}
                    <Route path={ROUTES.ROLES} element={<RoleList />} />
                    <Route path={ROUTES.ROLE_DETAIL} element={<RoleDetail />} />
                    <Route path={ROUTES.ROLE_CREATE} element={<RoleCreate />} />
                    <Route path={ROUTES.ROLE_EDIT} element={<RoleEdit />} />                  
                    
                    {/* Session Management */}
                    <Route path={ROUTES.SESSIONS} element={<SessionList />} /> 
                    
                    {/* Settings */}
                    <Route path={ROUTES.SETTINGS} element={<Settings />} />
                    
                    {/* Audit */}
                    <Route path={ROUTES.AUDIT} element={<AuditLogs />} />

                    {/* ============================================================
                        ORGANISATION MODULE ROUTES
                    ============================================================ */}
                    {/* Main */}
                    <Route path={ROUTES.ORGANISATION_DASHBOARD} element={<OrganisationDashboard />} />
                    <Route path={ROUTES.ORGANISATION_SETTINGS} element={<OrganisationSettings />} />
                    <Route path={ROUTES.ORGANISATION_ADMIN} element={<OrganisationAdmin />} />
                    <Route path={ROUTES.ORGANISATION_AUDIT} element={<OrganisationAudit />} />
                    <Route path={ROUTES.ORGANISATION_USERS} element={<OrganisationUsers />} />
                    <Route path={ROUTES.ORGANISATION_SUBSCRIPTION} element={<OrganisationSubscription />} />
                    <Route path={ROUTES.ORGANISATION_REPORTS} element={<OrganisationReports />} />
                    
                    {/* Structure */}
                    <Route path={ROUTES.ORGANISATION_DEPARTMENTS} element={<OrganisationDepartments />} />
                    <Route path={ROUTES.ORGANISATION_TEAMS} element={<OrganisationTeams />} />
                    <Route path={ROUTES.ORGANISATION_POSITIONS} element={<OrganisationPositions />} />
                    
                    {/* Configuration & Branding */}
                    <Route path={ROUTES.ORGANISATION_DOMAINS} element={<OrganisationDomains />} />
                    <Route path={ROUTES.ORGANISATION_BRANDING} element={<OrganisationBranding />} />
                    <Route path={ROUTES.ORGANISATION_CONTACTS} element={<OrganisationContacts />} />
                    <Route path={ROUTES.ORGANISATION_WORKFLOWS} element={<OrganisationWorkflows />} />
                    
                    {/* Security & Data */}
                    <Route path={ROUTES.ORGANISATION_API_TOKENS} element={<OrganisationApiTokens />} />
                    <Route path={ROUTES.ORGANISATION_2FA} element={<OrganisationTwoFactor />} />
                    <Route path={ROUTES.ORGANISATION_IMPORT} element={<OrganisationImport />} />
                    <Route path={ROUTES.ORGANISATION_EXPORT} element={<OrganisationExport />} />
                    
                    {/* Profile */}
                    <Route path={ROUTES.ORGANISATION_PROFILE} element={<OrganisationProfile />} />
                </Route>

                {/* ============================================================
                    ADMIN ROUTES - Super Admin Only
                ============================================================ */}
                <Route element={
                    <ProtectedRoute requiredRoles={['super_admin']}>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
                    <Route path={ROUTES.ADMIN_USERS} element={<AdminUsers />} />
                    <Route path={ROUTES.ADMIN_TENANTS} element={<AdminTenants />} />
                    <Route path={ROUTES.ADMIN_SYSTEM} element={<AdminSystem />} />
                </Route>

                {/* ============================================================
                    ERROR PAGES
                ============================================================ */}
                <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
                <Route path={ROUTES.SERVER_ERROR} element={<ServerError />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Alert />
        </Suspense>
    );
};

// ============================================================
// Main App Component with all Providers
// ============================================================
const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TenantProvider>
                    <PermissionProvider>
                        <NotificationProvider>
                            <OrganisationProvider>
                                <AppContent />
                            </OrganisationProvider>
                        </NotificationProvider>
                    </PermissionProvider>
                </TenantProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;