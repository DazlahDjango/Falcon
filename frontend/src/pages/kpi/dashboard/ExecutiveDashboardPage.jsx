import React from 'react';
import { ExecutiveDashboard } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const ExecutiveDashboardPage = () => {
    const { isAuthenticated, isExecutive, isSuperAdmin, isClientAdmin } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!isExecutive && !isSuperAdmin && !isClientAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <ExecutiveDashboard />
        </div>
    );
};

export default ExecutiveDashboardPage;