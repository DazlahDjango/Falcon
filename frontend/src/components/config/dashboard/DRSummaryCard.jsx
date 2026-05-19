import { FiShield, FiTarget, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export const DRSummaryCard = ({ stats }) => {
  const activePlans = Number(stats?.activePlans) || 0;
  const successfulDrills = Number(stats?.successfulDrills) || 0;
  const highRiskApps = Number(stats?.highRiskApps) || 0;
  const rtoRate = Number(stats?.rtoAchievementRate) || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FiShield className="text-purple-600 text-xl" />
          </div>
          <h3 className="font-semibold text-gray-800">Disaster Recovery</h3>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="text-xl font-bold text-purple-600">{activePlans}</div>
          <div className="text-xs text-gray-500">Active Plans</div>
        </div>
        <div>
          <div className="text-xl font-bold text-green-600">{successfulDrills}</div>
          <div className="text-xs text-gray-500">Drills Passed</div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1 text-xl font-bold text-red-600">{highRiskApps}</div>
          <div className="text-xs text-gray-500">High Risk</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">RTO Achievement</span>
          <span className="font-medium">{rtoRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${rtoRate}%` }} />
        </div>
      </div>
    </div>
  );
};