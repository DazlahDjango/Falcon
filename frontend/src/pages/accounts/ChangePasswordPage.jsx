import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChangePasswordForm } from '../../components/accounts/auth';
import { ACCOUNTS_ROUTES } from '../../config/constants/accountsRouteConstants';

export const ChangePasswordPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(ACCOUNTS_ROUTES.MY_PROFILE);
  };

  return (
    <div className="accounts-page change-password-page">
      <ChangePasswordForm onSuccess={handleSuccess} />
    </div>
  );
};

export default ChangePasswordPage;