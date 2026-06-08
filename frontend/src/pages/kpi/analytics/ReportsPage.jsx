import React from 'react';
import { ReportGenerator } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const ReportsPage = () => {
    const { isAuthenticated, canViewAnalytics, isExecutive, isSuperAdmin, isClientAdmin } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!canViewAnalytics && !isExecutive && !isSuperAdmin && !isClientAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <ReportGenerator />
        </div>
    );
};

export default ReportsPage;