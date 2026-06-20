import React, { useEffect } from 'react';
import { ConfigDashboardOverview } from '../../components/config/dashboard/ConfigDashboardOverview';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { MaintenanceActiveBanner } from '../../components/config/maintenance/MaintenanceActiveBanner';
import { useConfigDashboard } from '../../hooks/config';
import { useMaintenanceStatus } from '../../hooks/config';
import { FiRefreshCw } from 'react-icons/fi';

export const ConfigDashboardPage = () => {
  const { useOverview, useRecentActivity } = useConfigDashboard();
  const { maintenanceActive } = useMaintenanceStatus();
  const { refetch: refetchOverview } = useOverview();
  const { refetch: refetchRecent } = useRecentActivity();

  const handleRefresh = () => {
    refetchOverview();
    refetchRecent();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <ConfigBreadcrumb />
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiRefreshCw className="text-base" />
          Refresh
        </button>
      </div>
      
      {maintenanceActive && <MaintenanceActiveBanner />}
      
      <ConfigDashboardOverview />
    </div>
  );
};
export default ConfigDashboardPage;