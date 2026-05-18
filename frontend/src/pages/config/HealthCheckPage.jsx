import React from 'react';
import { HealthCheckList } from '../../components/config/health/HealthCheckList';
import { SystemMetricsDashboard } from '../../components/config/health/SystemMetricsDashboard';
import { ConditionalMaintenanceAlert } from '../../components/config/health/ConditionalMaintenanceAlert';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { useConfigPermissions } from '../../hooks/config';
import { FiActivity } from 'react-icons/fi';

export const HealthCheckPage = () => {
  const { isSuperAdmin } = useConfigPermissions();

  return (
    <div className="p-6">
      <div className="mb-4">
        <ConfigBreadcrumb />
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiActivity className="text-blue-600" />
          Health Monitoring
        </h1>
        <p className="text-gray-500 mt-1">Real-time system health and performance metrics</p>
      </div>

      {isSuperAdmin && <ConditionalMaintenanceAlert className="mb-6" />}

      <div className="mb-8">
        <SystemMetricsDashboard />
      </div>

      <HealthCheckList />
    </div>
  );
};