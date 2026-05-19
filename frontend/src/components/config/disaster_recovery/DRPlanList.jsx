import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisasterRecovery } from '../../../hooks/config';
import { StatusBadge } from '../common/StatusBadge';
import { DRExecuteModal } from './DRExecuteModal';
import { DRDrillModal } from './DRDrillModal';
import { FiPlus, FiEye, FiPlay, FiTarget, FiAlertTriangle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

export const DRPlanList = () => {
  const navigate = useNavigate();
  const { useDRPlans } = useDisasterRecovery();
  const [showExecuteModal, setShowExecuteModal] = useState(null);
  const [showDrillModal, setShowDrillModal] = useState(null);
  const { data, isLoading } = useDRPlans();

  const plans = data?.data?.results || [];

  const needsTesting = (plan) => {
    if (!plan.last_tested_at) return true;
    const daysSince = (new Date() - new Date(plan.last_tested_at)) / (1000 * 60 * 60 * 24);
    return daysSince > (plan.test_frequency_days || 30);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Disaster Recovery Plans</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <FiPlus /> Create DR Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 text-center py-8 text-gray-500">Loading...</div>
        ) : plans.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-gray-500">No DR plans found</div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{plan.name}</h3>
                  <p className="text-sm text-gray-500">{plan.app_name}</p>
                </div>
                <StatusBadge status={plan.status} size="sm" />
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm"><span className="text-gray-500">RTO Target:</span><span className="font-medium">{plan.rto_target_minutes} min</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">RPO Target:</span><span className="font-medium">{plan.rpo_target_minutes} min</span></div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Tested:</span>
                  <span className={`font-medium ${needsTesting(plan) ? 'text-yellow-600' : 'text-green-600'}`}>
                    {plan.last_tested_at ? formatDistanceToNow(new Date(plan.last_tested_at), { addSuffix: true }) : 'Never'}
                    {needsTesting(plan) && <FiAlertTriangle className="inline ml-1 text-yellow-500" size={12} />}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => navigate(`/config/disaster-recovery/${plan.id}`)} className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  <FiEye size={14} /> View
                </button>
                <button onClick={() => setShowExecuteModal(plan)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <FiPlay size={14} /> Execute
                </button>
                <button onClick={() => setShowDrillModal(plan)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FiTarget size={14} /> Drill
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showExecuteModal && <DRExecuteModal plan={showExecuteModal} onClose={() => setShowExecuteModal(null)} onSuccess={() => setShowExecuteModal(null)} />}
      {showDrillModal && <DRDrillModal plan={showDrillModal} onClose={() => setShowDrillModal(null)} onSuccess={() => setShowDrillModal(null)} />}
    </div>
  );
};