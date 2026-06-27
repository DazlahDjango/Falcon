import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/accounts/useAuth';
import { ACCOUNTS_ROUTES } from '../../config/constants/accountsRouteConstants';
import { MFAStatusCard } from '../../components/accounts/mfa';
import { ProfileCard } from '../../components/accounts/profiles';
import { SessionList } from '../../components/accounts/sessions';

export const DashboardPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="accounts-page dashboard-page">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ACCOUNTS_ROUTES.LOGIN} />;
  }

  return (
    <div className="accounts-page dashboard-page">
      <div className="dashboard-grid">
        <div className="dashboard-welcome">
          <h1>Welcome back, {user?.first_name || user?.email}!</h1>
          <p>Here's your account overview</p>
        </div>

        <div className="dashboard-cards">
          <MFAStatusCard />
          <ProfileCard profile={user} />
          <SessionList />
        </div>
      </div>
    </div>
  );
};