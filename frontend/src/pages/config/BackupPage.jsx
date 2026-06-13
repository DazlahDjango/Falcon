// frontend/src/pages/config/BackupPage.jsx
import React, { useState } from 'react';
import { BackupList } from '../../components/config/backup/BackupList';
import { BackupTriggerForm } from '../../components/config/backup/BackupTriggerForm';
import { BackupPolicyForm } from '../../components/config/backup/BackupPolicyForm';
import { BackupHistoryTable } from '../../components/config/backup/BackupHistoryTable';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { useRegistry } from '../../hooks/config';
import { useConfigPermissions } from '../../hooks/config';
import { FiPlus, FiSettings, FiList } from 'react-icons/fi';  // Changed FiHistory to FiList

export const BackupPage = () => {
  const [showTriggerForm, setShowTriggerForm] = useState(false);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const { useRegisteredApps } = useRegistry();
  const { canTriggerBackup } = useConfigPermissions();
  const { data: appsData } = useRegisteredApps();
  const apps = appsData?.data?.results || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <ConfigBreadcrumb />
        <div className="flex gap-3">
          {canTriggerBackup && (
            <button
              onClick={() => setShowTriggerForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus /> Trigger Backup
            </button>
          )}
          <button
            onClick={() => setShowPolicyForm(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiSettings /> Backup Settings
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiList /> Backup History
            </button>
          </div>
        </div>
        <div className="p-5">
          {activeTab === 'history' && <BackupList />}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Recent Backups</h3>
        </div>
        <div className="p-5">
          <BackupHistoryTable limit={10} />
        </div>
      </div>

      {showTriggerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Trigger Backup</h3>
              <button onClick={() => setShowTriggerForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5">
              <BackupTriggerForm
                apps={apps}
                onSuccess={() => {
                  setShowTriggerForm(false);
                  window.location.reload();
                }}
                onClose={() => setShowTriggerForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {showPolicyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Backup Policy Settings</h3>
              <button onClick={() => setShowPolicyForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-5">
              <BackupPolicyForm
                onSave={() => setShowPolicyForm(false)}
                onCancel={() => setShowPolicyForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BackupPage;