import React, { useEffect, lazy, Suspense, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AuthProvider, useAuthContext } from './contexts/accounts/AuthContext';
import { TenantProvider } from './contexts/accounts/TenantContext';
import { PermissionProvider } from './contexts/accounts/PermissionContext';
import { ThemeProvider } from './contexts/accounts/ThemeContext';
import { NotificationProvider } from './contexts/accounts/NotificationContext';
import { MainLayout, AuthLayout } from './components/common/Layout';
import LoadingScreen from './components/common/Feedback/LoadingScreen';
import Alert from './components/common/UI/Alert';
import { ROUTES } from './config/constants';
import { usePermissions } from './hooks/accounts/usePermissions';
import { setupAxiosInterceptors } from './services/accounts/api/client';
// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/accounts/Home'));
const Login = lazy(() => import('./components/accounts/auth/Login'));
const Register = lazy(() => import('./components/accounts/auth/Register'));
const MFAVerify = lazy(() => import('./components/accounts/auth/MFAVerify'));
const MFASetup = lazy(() => import('./components/accounts/auth/MFASetup'));
const ForgotPassword = lazy(() => import('./components/accounts/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./components/accounts/auth/ResetPassword'));
const VerifyEmail = lazy(() => import('./components/accounts/auth/VerifyEmail'));
const AcceptInvitation = lazy(() => import('./components/accounts/auth/AcceptInvitation'));
const Dashboard = lazy(() => import('./components/accounts/dashboard/Dashboard'));
const UserList = lazy(() => import('./components/accounts/users/UserList'));
const UserDetail = lazy(() => import('./components/accounts/users/UserDetail'));
const UserCreate = lazy(() => import('./components/accounts/users/UserCreate'));
const UserEdit = lazy(() => import('./components/accounts/users/UserEdit'));
const UserProfile = lazy(() => import('./components/accounts/users/UserProfile'));
const TeamView = lazy(() => import('./components/accounts/team/TeamView'));
const RoleList = lazy(() => import('./components/accounts/roles/RoleList'));
const RoleDetail = lazy(() => import('./components/accounts/roles/RoleDetail'));
const RoleCreate = lazy(() => import('./components/accounts/roles/RoleCreate'));
const RoleEdit = lazy(() => import('./components/accounts/roles/RoleEdit'));
const SessionList = lazy(() => import('./components/accounts/sessions/SessionList'));
const Settings = lazy(() => import('./components/accounts/settings/Settings'));
const AuditLogs = lazy(() => import('./components/accounts/audit/AuditLogs'));
const AdminDashboard = lazy(() => import('./components/accounts/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./components/accounts/admin/AdminUsers'));
const AdminTenants = lazy(() => import('./components/accounts/admin/AdminTenants'));
const AdminSystem = lazy(() => import('./components/accounts/admin/AdminSystem'));
const Help = lazy(() => import('./pages/accounts/Help'));
const About = lazy(() => import('./pages/accounts/About'));
const NotFound = lazy(() => import('./pages/accounts/NotFound'));
const Unauthorized = lazy(() => import('./pages/accounts/Unauthorized'));
const ServerError = lazy(() => import('./pages/accounts/ServerError'));

// Setup axios interceptors
setupAxiosInterceptors();

// Protected Route Component
const ProtectedRoute = ({ children, requiredRoles = null, requiredPermissions = null }) => {
    const { isAuthenticated, isLoading, user } = useAuthContext();
    const { hasAnyRole, hasAnyPermission } = usePermissions();
    const location = useLocation();
    const hasRedirected = useRef(false);

    // Still loading? Show loading screen
    if (isLoading) {
        return <LoadingScreen fullScreen message="Checking authentication..." />;
    }
    
    // Not authenticated? Go to login (but this shouldn't happen with token)
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Check roles
    if (requiredRoles && !hasAnyRole(requiredRoles)) {
        return <Navigate to="/unauthorized" replace />;
    }
    
    // Check permissions
    if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
        return <Navigate to="/unauthorized" replace />;
    }
    return children;
};
// Route with Layout Component
const RouteWithLayout = ({ layout: Layout, component: Component, ...props }) => {
    return (
        <Layout>
            <Component {...props} />
        </Layout>
    );
};
// Main App Component
const AppContent = () => {
    const { isAuthenticated, user } = useAuthContext();
    const location = useLocation();
    // Track page views
    useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            // Analytics tracking would go here
            console.log('Page view:', location.pathname);
        }
    }, [location]);
    return (
        <Suspense fallback={<LoadingScreen fullScreen />}>
            <Routes>
                {/* Public Routes - No Layout */}
                <Route path={ROUTES.HOME} element={<Home />} />
                <Route path={ROUTES.ABOUT} element={<About />} />
                <Route path={ROUTES.HELP} element={<Help />} />
                {/* Auth Routes - AuthLayout */}
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
                {/* Protected Routes - MainLayout */}
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
                    {/* Admin Routes - Super Admin Only */}
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
                </Route>

                {/* Error Pages */}
                <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
                <Route path={ROUTES.SERVER_ERROR} element={<ServerError />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
            {/* Global Alert Toast */}
            <Alert />
        </Suspense>
    );
};
// App with all providers
const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TenantProvider>
                    <PermissionProvider>
                        <NotificationProvider>
                            <AppContent />
                        </NotificationProvider>
                    </PermissionProvider>
                </TenantProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};
export default App;