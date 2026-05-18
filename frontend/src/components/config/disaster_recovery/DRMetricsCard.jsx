import { useDisasterRecovery } from '../../../hooks/config';
import { FiTarget, FiClock, FiCheckCircle, FiBarChart2, FiAlertTriangle } from 'react-icons/fi';

export const DRMetricsCard = ({ appName }) => {
  const { useDRMetrics } = useDisasterRecovery();
  const { data, isLoading } = useDRMetrics(appName);

  if (isLoading) return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse"><div className="h-32 bg-gray-100 rounded"></div></div>;

  const metrics = data?.data || {};
  const rtoRate = metrics.rto_achievement_rate || 0;
  const rpoRate = metrics.rpo_achievement_rate || 0;
  const drillRate = metrics.drill_success_rate || 0;

  const getProgressColor = (value) => {
    if (value >= 90) return 'bg-green-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = (value, type) => {
    if (value >= 90) return 'Excellent';
    if (value >= 70) return 'Good';
    if (value >= 50) return 'Needs Improvement';
    return 'Critical';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <FiBarChart2 className="text-purple-600 text-xl" />
        </div>
        <h3 className="font-semibold text-gray-800">DR Performance Metrics</h3>
        {appName && <span className="text-xs text-gray-400 ml-auto">{appName}</span>}
      </div>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1"><FiTarget className="text-xs" /> RTO Achievement</span>
            <span className={`font-medium ${rtoRate >= 70 ? 'text-green-600' : rtoRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{rtoRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${getProgressColor(rtoRate)}`} style={{ width: `${rtoRate}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Status: {getStatusText(rtoRate, 'rto')}</p>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1"><FiClock className="text-xs" /> RPO Achievement</span>
            <span className={`font-medium ${rpoRate >= 70 ? 'text-green-600' : rpoRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{rpoRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${getProgressColor(rpoRate)}`} style={{ width: `${rpoRate}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Status: {getStatusText(rpoRate, 'rpo')}</p>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1"><FiCheckCircle className="text-xs" /> Drill Success Rate</span>
            <span className={`font-medium ${drillRate >= 70 ? 'text-green-600' : drillRate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{drillRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${getProgressColor(drillRate)}`} style={{ width: `${drillRate}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};