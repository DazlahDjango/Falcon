import { useConfigDashboard } from '../../../hooks/config';
import { BackupStatsCard } from './BackupStatsCard';
import { MaintenanceStatusCard } from './MaintenanceStatusCard';
import { DRSummaryCard } from './DRSummaryCard';
import { HealthStatusCard } from './HealthStatusCard';
import { QuotaUsageCard } from './QuotaUsageCard';
import { RecentActivityList } from './RecentActivityList';
import { LoadingOverlay } from '../../common/UI/LoadingOverlay';
import { FiAlertCircle } from 'react-icons/fi';

export const ConfigDashboardOverview = () => {
  const { useOverview, useRecentActivity } = useConfigDashboard();
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useOverview();
  const { data: recentActivity, isLoading: recentLoading } = useRecentActivity();

  if (overviewLoading) return <LoadingOverlay />;
  if (overviewError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-red-500">
        <FiAlertCircle className="text-2xl mr-2" />
        Failed to load dashboard data
      </div>
    );
  }

  const stats = overview?.data || { apps: {}, backups: {}, maintenance: {}, disasterRecovery: {}, quota: {} };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BackupStatsCard stats={stats.backups} />
        <MaintenanceStatusCard stats={stats.maintenance} />
        <DRSummaryCard stats={stats.disasterRecovery} />
        <QuotaUsageCard usagePercent={stats.quota?.usagePercent || 0} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthStatusCard apps={stats.apps} />
        <RecentActivityList activities={recentActivity?.data} isLoading={recentLoading} />
      </div>
    </div>
  );
};