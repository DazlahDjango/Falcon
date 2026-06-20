import React, { useState } from 'react';
import { DRPlanList } from '../../components/config/disaster_recovery/DRPlanList';
import { DRPlanForm } from '../../components/config/disaster_recovery/DRPlanForm';
import { DRMetricsCard } from '../../components/config/disaster_recovery/DRMetricsCard';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { useConfigPermissions } from '../../hooks/config';
import { FiPlus, FiBarChart2 } from 'react-icons/fi';

export const DisasterRecoveryPage = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { canExecuteDR } = useConfigPermissions();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <ConfigBreadcrumb />
        {canExecuteDR && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus /> Create DR Plan
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <DRPlanList />
        </div>
        <div className="lg:col-span-1">
          <DRMetricsCard />
        </div>
      </div>

      {showCreateForm && (
        <DRPlanForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};
export default DisasterRecoveryPage;