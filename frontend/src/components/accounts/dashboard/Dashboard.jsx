import React from 'react';
import { useAuthContext } from '../../../contexts/accounts/AuthContext';
import { usePermissionContext } from '../../../contexts/accounts/PermissionContext';
import UserDashboard from './UserDashboard';
import TeamDashboard from './TeamDashboard';
import ExecutiveDashboard from './ExecutiveDashboard';
import AdminDashboard from '../admin/AdminDashboard';
import KPIDashboardPage from '../../../pages/kpi/KPIDashboardPage';

const Dashboard = () => {
    const { user, isLoading } = useAuthContext();
    const { hasAnyRole } = usePermissionContext();
    // Show loading while checking auth
    if (isLoading || !user) {
        return <div>Loading dashboard...</div>;
    }
    
    // Render based on role
    if (user?.role === 'super_admin') {
        return <AdminDashboard />;
    }
    // Option 2: Show KPI Dashboard for all non-admin users
    if (hasAnyRole(['executive', 'client_admin', 'supervisor', 'dashboard_champion', 'staff'])) {
        return <KPIDashboardPage />;
    }
    if (user?.role === 'executive' || user?.role === 'client_admin') {
        return <ExecutiveDashboard />;
    }
    if (user?.role === 'supervisor') {
        return <TeamDashboard />;
    }
    return <UserDashboard />;
};

export default Dashboard;