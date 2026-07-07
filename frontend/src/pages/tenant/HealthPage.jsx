// pages/tenant/HealthPage.jsx
import React from 'react';
import { HealthCheck, OrganizationsHealth } from '../../components/tenant';
import { useAuth } from '../../hooks/accounts';

const HealthPage = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin' || user?.is_superuser;

  return (
    <div className="tenant-app">
      {isSuperAdmin ? <OrganizationsHealth /> : <HealthCheck />}
    </div>
  );
};

export default HealthPage;