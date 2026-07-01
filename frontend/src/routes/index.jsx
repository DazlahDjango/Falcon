import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import accountsRoutes from "./accounts.routes";
import tenantRoutes from "./tenant.routes";
import structureRoutes from "./structure.routes";
import kpiRoutes from "./kpi.routes";
import billingRoutes from "./billing.routes";
import reviewsRoutes from "./reviews.routes";
import configRoutes from "./config.routes";
import dashboardRoutes from "./dashboard.routes";

// Layouts
const AuthLayout = React.lazy(() => import("../components/dashboard/Layout/AuthLayout"));
const RoleBasedAppLayout = React.lazy(() => import("../components/dashboard/Layout/RoleBasedAppLayout"));

// Auth pages
const LoginPage = React.lazy(() => import('../pages/accounts/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/accounts/RegisterPage'));
const PasswordResetPage = React.lazy(() => import('../pages/accounts/PasswordResetPage'));
const PasswordResetConfirmPage = React.lazy(() => import('../pages/accounts/PasswordResetConfirmPage'));

// Error pages
const Unauthorized = React.lazy(() => import('../pages/accounts/Unauthorized'));
const NotFound = React.lazy(() => import('../pages/accounts/NotFound'));
const ServerError = React.lazy(() => import('../pages/accounts/ServerError'));

// ✅ FIXED: Convert route arrays to JSX elements - properly handles all cases
const renderRoutes = (routes) => {
    return routes.map((route, index) => {
        // ✅ Handle index routes
        if (route.index) {
            return <Route key={`index-${index}`} index element={route.element} />;
        }
        
        // ✅ Handle routes with children
        if (route.children) {
            return (
                <Route key={route.path || `route-${index}`} path={route.path}>
                    {renderRoutes(route.children)}
                </Route>
            );
        }
        
        // ✅ Handle regular routes - ensure path is a string
        const path = typeof route.path === 'string' ? route.path : undefined;
        return <Route key={route.path || `route-${index}`} path={path} element={route.element} />;
    });
};

const AppRouter = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<PasswordResetPage />} />
                    <Route path="/reset-password" element={<PasswordResetConfirmPage />} />
                </Route>
            </Route>
            
            {/* Protected routes */}
            <Route element={<PrivateRoute />}>
                {/* Default redirect for root path */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* Dashboard routes (takes priority, uses DashboardShell) */}
                {dashboardRoutes.map((route, idx) => (
                    <Route key={idx} path={route.path} element={route.element}>
                        {route.children?.map((child, childIdx) => (
                            <Route key={childIdx} {...child} />
                        ))}
                    </Route>
                ))}
                
                {/* Legacy app routes */}
                <Route element={<RoleBasedAppLayout />}>
                    {/* Account routes */}
                    {renderRoutes(accountsRoutes)}
                    {/* Tenants routes */}
                    {renderRoutes(tenantRoutes)}
                    {/* Structure routes */}
                    {renderRoutes(structureRoutes)}
                    {/* KPI routes */}
                    {renderRoutes(kpiRoutes)}
                    {/* Billing routes */}
                    {renderRoutes(billingRoutes)}
                    {/* Reviews routes */}
                    {renderRoutes(reviewsRoutes)}
                    {/* Config routes */}
                    {renderRoutes(configRoutes)}
                    
                    {/* Error routes */}
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/server-error" element={<ServerError />} />
                </Route>
                
                {/* Fallback for unknown routes */}
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
};

export default AppRouter;