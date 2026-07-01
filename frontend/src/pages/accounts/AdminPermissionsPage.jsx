import React from 'react';
import { AdminPermissionManager } from '../../components/accounts/admin';

export const AdminPermissionsPage = () => {
  return (
    <div className="accounts-page admin-permissions-page">
      <AdminPermissionManager />
    </div>
  );
};

export default AdminPermissionsPage;