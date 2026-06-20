import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuthContext } from '../contexts/accounts/AuthContext';

const PrivateRoute = () => {
    const location = useLocation();
    // Primary: read from Redux (set synchronously on login.fulfilled)
    const reduxAuth = useSelector((state) => state.auth);
    // Secondary: AuthContext tracks local loading state for the /me fetch
    const { isLoading } = useAuthContext();

    // If Redux already says authenticated, let through immediately
    // (avoids waiting 60s for /users/me/ to respond)
    if (reduxAuth.isAuthenticated) {
        return <Outlet />;
    }

    // Still loading the initial user check — show spinner
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    // Not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
};
export default PrivateRoute;