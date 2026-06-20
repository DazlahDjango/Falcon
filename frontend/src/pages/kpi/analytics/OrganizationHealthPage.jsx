import React from 'react';
import { OrganizationHealth } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const OrganizationHealthPage = () => {
    const { isAuthenticated, isExecutive, isSuperAdmin, isClientAdmin } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!isExecutive && !isSuperAdmin && !isClientAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <OrganizationHealth />
        </div>
    );
};

export default OrganizationHealthPage;