import { useHealthCheck } from '../../../hooks/config';
import { FiCpu, FiHardDrive, FiDatabase, FiActivity } from 'react-icons/fi';

export const SystemMetricsDashboard = () => {
  const { useSystemMetrics } = useHealthCheck();
  const { data, isLoading } = useSystemMetrics();

  const metrics = data?.data || {};

  if (isLoading) return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse"><div className="h-32 bg-gray-100 rounded"></div></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg"><FiCpu className="text-blue-600 text-xl" /></div>
          <h3 className="font-medium text-gray-800">CPU Usage</h3>
        </div>
        <div className="text-2xl font-bold text-gray-800">{metrics.cpu_percent || 0}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div className={`h-2 rounded-full ${(metrics.cpu_percent || 0) > 80 ? 'bg-red-500' : (metrics.cpu_percent || 0) > 60 ? 'bg-yellow-500' : 'bg-blue-500'}`} style={{ width: `${metrics.cpu_percent || 0}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-green-100 rounded-lg"><FiHardDrive className="text-green-600 text-xl" /></div>
          <h3 className="font-medium text-gray-800">Memory Usage</h3>
        </div>
        <div className="text-2xl font-bold text-gray-800">{metrics.memory_percent || 0}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div className={`h-2 rounded-full ${(metrics.memory_percent || 0) > 80 ? 'bg-red-500' : (metrics.memory_percent || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${metrics.memory_percent || 0}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-yellow-100 rounded-lg"><FiHardDrive className="text-yellow-600 text-xl" /></div>
          <h3 className="font-medium text-gray-800">Disk Usage</h3>
        </div>
        <div className="text-2xl font-bold text-gray-800">{metrics.disk_usage || 0}%</div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div className={`h-2 rounded-full ${(metrics.disk_usage || 0) > 85 ? 'bg-red-500' : (metrics.disk_usage || 0) > 70 ? 'bg-yellow-500' : 'bg-yellow-600'}`} style={{ width: `${metrics.disk_usage || 0}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-purple-100 rounded-lg"><FiDatabase className="text-purple-600 text-xl" /></div>
          <h3 className="font-medium text-gray-800">DB Size</h3>
        </div>
        <div className="text-2xl font-bold text-gray-800">{metrics.database_size_gb?.toFixed(1) || 0} GB</div>
        <div className="text-sm text-gray-500 mt-1">Active Connections: {metrics.active_connections || 0}</div>
      </div>
    </div>
  );
};