import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoleForm } from '../../components/accounts/roles';
import { useRoles } from '../../hooks/accounts/useRoles';
import { ACCOUNTS_ROUTES } from '../../config/constants/accountsRouteConstants';

export const RoleEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRole, selectedRole, isLoading } = useRoles();

  useEffect(() => {
    if (id) {
      getRole(id);
    }
  }, [id, getRole]);

  const handleSuccess = () => {
    navigate(ACCOUNTS_ROUTES.ROLE_DETAIL(id));
  };

  const handleCancel = () => {
    navigate(ACCOUNTS_ROUTES.ROLE_DETAIL(id));
  };

  if (isLoading && !selectedRole) {
    return (
      <div className="accounts-page role-edit-page">
        <div className="spinner" />
        <p>Loading role...</p>
      </div>
    );
  }

  return (
    <div className="accounts-page role-edit-page">
      <div className="page-header">
        <h1>Edit Role</h1>
      </div>
      <RoleForm role={selectedRole} onClose={handleCancel} onSuccess={handleSuccess} />
    </div>
  );
};
export default RoleEditPage;