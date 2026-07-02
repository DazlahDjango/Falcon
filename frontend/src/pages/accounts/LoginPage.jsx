import React from 'react';
import { LoginForm } from '../../components/accounts/auth';
import DebugLoginPanel from '../../components/auth/DebugLoginPanel';

export const LoginPage = () => {
  return (
    <div className="accounts-page login-page">
      <LoginForm />
      <DebugLoginPanel isVisible={true} />
    </div>
  );
};
export default LoginPage;