// src/routes/index.jsx
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
import { getDefaultRouteByRole } from "../config/constants/dashboardRouteConstants";

// Layouts
const AuthLayout = React.lazy(() => import("../components/common/Layout/AuthLayout"));
// Auth pages
const Login = React.lazy(() => import('../components/accounts/auth/Login'));
const Register = React.lazy(() => import('../components/accounts/auth/Register'));
const ForgotPassword = React.lazy(() => import('../components/accounts/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../components/accounts/auth/ResetPassword'));
// Error pages
const Unauthorized = React.lazy(() => import('../pages/accounts/Unauthorized'));
const NotFound = React.lazy(() => import('../pages/accounts/NotFound'));
const ServerError = React.lazy(() => import('../pages/accounts/ServerError'));
// Convert route arrays to JSX elements
const renderRoutes = (routes) => {
    return routes.map((route) => {
        if (route.children) {
            return (
                <Route key={route.path} path={route.path}>
                    {renderRoutes(route.children)}
                </Route>
            );
        }
        return <Route key={route.path || 'index'} {...route} />;
    });
};
const AppRouter = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route element={<PublicRoute />}>
                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
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
                <Route element={<AuthLayout />}>
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