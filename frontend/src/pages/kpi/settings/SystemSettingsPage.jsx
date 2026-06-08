import React from 'react';
import { SystemSettings } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const SystemSettingsPage = () => {
    const { isAuthenticated, isSuperAdmin, isClientAdmin } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!isSuperAdmin && !isClientAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <SystemSettings />
        </div>
    );
};

export default SystemSettingsPage;