import React, { useState } from 'react';
import { MaintenanceList } from '../../components/config/maintenance/MaintenanceList';
import { MaintenanceScheduleForm } from '../../components/config/maintenance/MaintenanceScheduleForm';
import { MaintenanceHistoryTable } from '../../components/config/maintenance/MaintenanceHistoryTable';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { useConfigPermissions } from '../../hooks/config';
import { FiPlus, FiList } from 'react-icons/fi';  // Changed FiHistory to FiList

export const MaintenancePage = () => {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const { canScheduleMaintenance } = useConfigPermissions();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <ConfigBreadcrumb />
        {canScheduleMaintenance && (
          <button
            onClick={() => setShowScheduleForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus /> Schedule Maintenance
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'upcoming'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming & Active
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiList /> History
            </button>
          </div>
        </div>
        <div className="p-5">
          {activeTab === 'upcoming' && <MaintenanceList />}
          {activeTab === 'history' && <MaintenanceHistoryTable limit={20} />}
        </div>
      </div>

      {showScheduleForm && (
        <MaintenanceScheduleForm
          onClose={() => setShowScheduleForm(false)}
          onSuccess={() => {
            setShowScheduleForm(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};