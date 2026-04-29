import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/accounts/useAuth';

const PrivateRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <Outlet />;
};
export default PrivateRoute;