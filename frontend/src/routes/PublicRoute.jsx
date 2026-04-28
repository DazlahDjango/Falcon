import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/accounts/useAuth';

const PublicRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }
    if (isAuthenticated) {
        return <Navigate to="/kpi/dashboard" replace />;
    }
    return <Outlet />;
};
export default PublicRoute;