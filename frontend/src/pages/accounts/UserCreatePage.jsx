import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserForm } from '../../components/accounts/users';
import { ACCOUNTS_ROUTES } from '../../config/constants/accountsRouteConstants';

export const UserCreatePage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(ACCOUNTS_ROUTES.USERS);
  };

  const handleCancel = () => {
    navigate(ACCOUNTS_ROUTES.USERS);
  };

  return (
    <div className="accounts-page user-create-page">
      <div className="page-header">
        <h1>Create User</h1>
      </div>
      <UserForm onClose={handleCancel} onSuccess={handleSuccess} />
    </div>
  );
};
export default UserCreatePage;