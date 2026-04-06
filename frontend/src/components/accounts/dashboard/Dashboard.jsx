import React from 'react';
import { useAuthContext } from '../../../contexts/accounts/AuthContext';
import UserDashboard from './UserDashboard';
import TeamDashboard from './TeamDashboard';
import ExecutiveDashboard from './ExecutiveDashboard';
import AdminDashboard from '../admin/AdminDashboard';

const Dashboard = () => {
    const { user, isLoading } = useAuthContext();
    
    // Show loading while checking auth
    if (isLoading || !user) {
        return <div>Loading dashboard...</div>;
    }
    
    // Render based on role
    if (user?.role === 'super_admin') {
        return <AdminDashboard />;
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