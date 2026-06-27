import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleForm } from '../../components/accounts/roles';
import { ACCOUNTS_ROUTES } from '../../config/constants/accountsRouteConstants';

export const RoleCreatePage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(ACCOUNTS_ROUTES.ROLES);
  };

  const handleCancel = () => {
    navigate(ACCOUNTS_ROUTES.ROLES);
  };

  return (
    <div className="accounts-page role-create-page">
      <div className="page-header">
        <h1>Create Role</h1>
      </div>
      <RoleForm onClose={handleCancel} onSuccess={handleSuccess} />
    </div>
  );
};
export default RoleCreatePage;