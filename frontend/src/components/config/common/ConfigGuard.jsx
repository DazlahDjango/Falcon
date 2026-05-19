import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useConfigPermissions } from '../../../hooks/config';

export const ConfigGuard = () => {
  const { canAccessConfig } = useConfigPermissions();
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!canAccessConfig) return <Navigate to="/kpi/dashboard" replace />;
  return <Outlet />;
};