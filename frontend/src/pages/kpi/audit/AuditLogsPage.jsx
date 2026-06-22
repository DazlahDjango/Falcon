import React from 'react';
import { AuditLogs } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const AuditLogsPage = () => {
    const { isAuthenticated, canViewAuditLogs, isSuperAdmin, isClientAdmin } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!canViewAuditLogs && !isSuperAdmin && !isClientAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <AuditLogs />
        </div>
    );
};

export default AuditLogsPage;