import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserForm } from '../../components/accounts/users';
import { useUsers } from '../../hooks/accounts/useUsers';
import { ACCOUNTS_ROUTES } from '../../config/constants/accountsRouteConstants';

export const UserEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getUser, selectedUser, isLoading } = useUsers();

  useEffect(() => {
    if (id) {
      getUser(id);
    }
  }, [id, getUser]);

  const handleSuccess = () => {
    navigate(ACCOUNTS_ROUTES.USER_DETAIL(id));
  };

  const handleCancel = () => {
    navigate(ACCOUNTS_ROUTES.USER_DETAIL(id));
  };

  if (isLoading && !selectedUser) {
    return (
      <div className="accounts-page user-edit-page">
        <div className="spinner" />
        <p>Loading user...</p>
      </div>
    );
  }

  return (
    <div className="accounts-page user-edit-page">
      <div className="page-header">
        <h1>Edit User</h1>
      </div>
      <UserForm user={selectedUser} onClose={handleCancel} onSuccess={handleSuccess} />
    </div>
  );
};
export default UserEditPage;