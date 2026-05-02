// src/routes/index.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import accountsRoutes from "./accounts.routes";
import organisationsRoutes from "./organisations.routes";
import kpiRoutes from "./kpi.routes";
import structureRoutes from "./structure.routes";

// Layouts
const MainLayout = React.lazy(() => import("../components/common/Layout/MainLayout"));
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
    return routes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
    ));
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
                <Route element={<MainLayout />}>
                    <Route index element={<Navigate to="/kpi/dashboard" replace />} />
                    {/* Account routes */}
                    {renderRoutes(accountsRoutes)}
                    {/* Structure routes */}
                    {renderRoutes(structureRoutes)}
                    {/* Organisation routes */}
                    {renderRoutes(organisationsRoutes)} 
                    {/* KPI routes */}
                    {renderRoutes(kpiRoutes)}
                    {/* Error routes */}
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/server-error" element={<ServerError />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Route>
        </Routes>
    );
};
export default AppRouter;