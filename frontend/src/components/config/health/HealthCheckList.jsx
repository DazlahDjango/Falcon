import { useState } from 'react';
import { useHealthCheck } from '../../../hooks/config';
import { HealthStatusBadge } from './HealthStatusBadge';
import { FiRefreshCw, FiActivity, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export const HealthCheckList = () => {
  const { useLatestHealth, checkAllApps } = useHealthCheck();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data, isLoading, refetch } = useLatestHealth();

  const healthData = data?.data || {};

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await checkAllApps.mutateAsync();
      await refetch();
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getResponseTimeColor = (ms) => {
    if (!ms) return 'text-gray-400';
    if (ms < 500) return 'text-green-600';
    if (ms < 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  const apps = Object.entries(healthData);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Health Check Status</h1>
        <button onClick={handleRefreshAll} disabled={isRefreshing} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          <FiRefreshCw className={isRefreshing ? 'animate-spin' : ''} />
          Check All Apps
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-sm text-gray-600">
              <th className="px-5 py-3">Application</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Response Time</th>
              <th className="px-5 py-3">Last Check</th>
              <th className="px-5 py-3">Consecutive Failures</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : apps.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-gray-500">No health data available</td></tr>
            ) : (
              apps.map(([appName, check]) => (
                <tr key={appName} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-800">{appName}</td>
                  <td className="px-5 py-3"><HealthStatusBadge status={check.status} /></td>
                  <td className="px-5 py-3">
                    <span className={getResponseTimeColor(check.response_time_ms)}>
                      {check.response_time_ms ? `${check.response_time_ms}ms` : '-'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {check.last_check_at ? formatDistanceToNow(new Date(check.last_check_at), { addSuffix: true }) : '-'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-sm ${check.consecutive_failures > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                      {check.consecutive_failures || 0}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};