import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDashboardProfileContext } from '../../../contexts/dashboard/DashboardProfileContext';
import { getDefaultRouteByRole } from '../../../config/constants/dashboardRouteConstants';
import LoadingScreen from '../../common/Feedback/LoadingScreen';

/**
 * Sends /dashboard to the correct role overview (requires DashboardProviders).
 */
const DashboardIndexRedirect = () => {
  const { dashboardRole, loading } = useDashboardProfileContext();

  if (loading) {
    return <LoadingScreen message="Loading dashboard…" />;
  }

  const target = getDefaultRouteByRole(dashboardRole);
  return <Navigate to={target} replace />;
};

export default DashboardIndexRedirect;
