import React from 'react';
import { AnalyticsInsights } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const AnalyticsPage = () => {
    const { isAuthenticated, canViewAnalytics } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!canViewAnalytics) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <AnalyticsInsights />
        </div>
    );
};

export default AnalyticsPage;