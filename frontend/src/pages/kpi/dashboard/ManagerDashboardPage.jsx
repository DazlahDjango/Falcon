import React from 'react';
import { ManagerDashboard } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const ManagerDashboardPage = () => {
    const { isAuthenticated, isManager, isSuperAdmin, isClientAdmin, isExecutive } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!isManager && !isSuperAdmin && !isClientAdmin && !isExecutive) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <ManagerDashboard />
        </div>
    );
};

export default ManagerDashboardPage;