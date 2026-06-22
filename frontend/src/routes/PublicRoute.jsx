import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuthContext } from '../contexts/accounts/AuthContext';

const PublicRoute = () => {
    // Read from Redux — set synchronously when login.fulfilled fires
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { isLoading } = useAuthContext();

    // Still doing the initial user check — show spinner, don't redirect yet
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};
export default PublicRoute;