import { FiActivity, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

export const HealthStatusCard = ({ apps }) => {
  const healthy = apps?.healthy || 0;
  const degraded = apps?.degraded || 0;
  const unhealthy = apps?.unhealthy || 0;
  const total = (apps?.total || healthy + degraded + unhealthy);

  const getStatusColor = () => {
    if (unhealthy > 0) return 'text-red-600';
    if (degraded > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <FiActivity className="text-green-600 text-xl" />
          </div>
          <h3 className="font-semibold text-gray-800">System Health</h3>
        </div>
        <div className={`text-2xl font-bold ${getStatusColor()}`}>{total}</div>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-2 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center gap-1">
            <FiCheckCircle className="text-green-600" />
            <span className="text-xl font-bold text-green-600">{healthy}</span>
          </div>
          <div className="text-xs text-gray-500">Healthy</div>
        </div>
        <div className="p-2 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-center gap-1">
            <FiAlertTriangle className="text-yellow-600" />
            <span className="text-xl font-bold text-yellow-600">{degraded}</span>
          </div>
          <div className="text-xs text-gray-500">Degraded</div>
        </div>
        <div className="p-2 bg-red-50 rounded-lg">
          <div className="flex items-center justify-center gap-1">
            <FiXCircle className="text-red-600" />
            <span className="text-xl font-bold text-red-600">{unhealthy}</span>
          </div>
          <div className="text-xs text-gray-500">Unhealthy</div>
        </div>
      </div>
    </div>
  );
};