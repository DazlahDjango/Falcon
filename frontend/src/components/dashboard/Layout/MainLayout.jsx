import React, { useEffect, useState, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useMediaQuery } from '../../../hooks/accounts/useMediaQuery';
import { logout } from '../../../store/accounts/slice/authSlice';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import { store as appStore } from '../../../store';
import { useAppAuth } from '../../../hooks/dashboard/useAppAuth';
import { useDashboardProfileContext } from '../../../contexts/dashboard/DashboardProfileContext';
import { useDashboardRealtime } from '../../../contexts/dashboard/DashboardRealtimeContext';
import LoadingScreen from '../../common/Feedback/LoadingScreen';
import { GlobalMaintenanceBanner } from '../../config/common/GlobalMaintenanceBanner';
import { GlobalSecurityBanner } from '../../accounts/common/GlobalSecurityBanner';
import { GlobalKpiBanner } from '../../kpi/common/GlobalKpiBanner';
import { GlobalTenantQuotaBanner } from '../../tenant/common/GlobalTenantQuotaBanner';
import { DASHBOARD_TYPES } from '../../../config/constants/dashboardConstants';
import {
  ExecutiveSidebar,
  ClientAdminSidebar,
  SuperAdminSidebar,
  ManagerSidebar,
  StaffSidebar,
  ChampionSidebar,
  ReadOnlySidebar,
} from '../Sidebar';

const Header = React.lazy(() => import('./Header'));
const Footer = React.lazy(() => import('./Footer'));

const SIDEBAR_BY_ROLE = {
  [DASHBOARD_TYPES.EXECUTIVE]: ExecutiveSidebar,
  [DASHBOARD_TYPES.CLIENT_ADMIN]: ClientAdminSidebar,
  [DASHBOARD_TYPES.SUPER_ADMIN]: SuperAdminSidebar,
  [DASHBOARD_TYPES.MANAGER]: ManagerSidebar,
  [DASHBOARD_TYPES.STAFF]: StaffSidebar,
  [DASHBOARD_TYPES.CHAMPION]: ChampionSidebar,
  [DASHBOARD_TYPES.READ_ONLY]: ReadOnlySidebar,
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isAuthenticated, isLoading } = useAppAuth();
  const { profile, loading: profileLoading, dashboardRole } = useDashboardProfileContext();
  const { connected: wsConnected } = useDashboardRealtime();

  const displayUser = profile || null;
  const SidebarComponent = SIDEBAR_BY_ROLE[dashboardRole] || StaffSidebar;

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
      setSidebarCollapsed(true);
    } else {
      setSidebarOpen(true);
      setSidebarCollapsed(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  if (isLoading || profileLoading) {
    return <LoadingScreen fullScreen message="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
      setSidebarOpen(!sidebarCollapsed);
    }
  };

  const handleLogout = async () => {
    try {
      await appStore.dispatch(logout()).unwrap();
      appStore.dispatch(showAlert({ type: 'success', message: 'Logged out successfully' }));
    } catch (error) {
      appStore.dispatch(showAlert({ type: 'error', message: error.message || 'Logout failed' }));
    }
  };

  return (
    <div className={`main-layout dashboard-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Suspense fallback={<div className="sidebar-loading" />}>
        <SidebarComponent
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
          user={displayUser}
          currentTenant={displayUser?.tenantId ? { id: displayUser.tenantId, name: displayUser.tenant_name } : null}
          currentPath={location.pathname}
          wsConnected={wsConnected}
        />
      </Suspense>
      <div className={`main-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
        <Suspense fallback={<div className="header-loading" />}>
          <Header
            user={displayUser}
            dashboardRole={dashboardRole}
            onToggleSidebar={toggleSidebar}
            onLogout={handleLogout}
            sidebarOpen={sidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            wsConnected={wsConnected}
          />
        </Suspense>
        <GlobalMaintenanceBanner />
        <GlobalSecurityBanner />
        <GlobalKpiBanner />
        <GlobalTenantQuotaBanner />
        <main className="content-wrapper">
          <Suspense fallback={<LoadingScreen message="Loading..." />}>
            <Outlet />
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
};

export default MainLayout;
