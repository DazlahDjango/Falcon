import React from 'react';
import { useSelector } from 'react-redux';
import UserDashboard from './UserDashboard';
import TeamDashboard from './TeamDashboard';
import ExecutiveDashboard from './ExecutiveDashboard';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    if (user?.role === 'executive' || user?.role === 'client_admin') {
        return <ExecutiveDashboard />;
    }
    if (user?.role === 'supervisor') {
        return <TeamDashboard />;
    }
    return <UserDashboard />;
};
export default Dashboard;