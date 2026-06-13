import React from 'react';
import { AdminDashboard } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const AdminDashboardPage = () => {
    const { isAuthenticated, isSuperAdmin, isClientAdmin } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (!isSuperAdmin && !isClientAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <AdminDashboard />
        </div>
    );
};

export default AdminDashboardPage;