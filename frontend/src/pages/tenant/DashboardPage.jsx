// pages/tenant/DashboardPage.jsx
import React from 'react';
import { SuperAdminDashboard, ClientAdminDashboard } from '../../components/tenant';
import { useAuth } from '../../hooks/accounts';

const DashboardPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin' || user?.is_superuser;

  return (
    <div className="tenant-app">
      {isSuperAdmin ? <SuperAdminDashboard /> : <ClientAdminDashboard />}
    </div>
  );
};

export default DashboardPage;