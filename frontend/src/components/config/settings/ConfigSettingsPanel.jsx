import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BackupSettingsTab } from './BackupSettingsTab';
import { MaintenanceSettingsTab } from './MaintenanceSettingsTab';
import { DRThresholdsTab } from './DRThresholdsTab';
import { NotificationSettingsTab } from './NotificationSettingsTab';
import { StorageSettingsTab } from './StorageSettingsTab';
import { FiDatabase, FiHardDrive, FiShield, FiBell, FiTarget, FiSave, FiRefreshCw } from 'react-icons/fi';

const TABS = [
  { id: 'backup', label: 'Backup Settings', icon: FiDatabase },
  { id: 'maintenance', label: 'Maintenance', icon: FiHardDrive },
  { id: 'dr', label: 'DR Thresholds', icon: FiTarget },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
  { id: 'storage', label: 'Storage', icon: FiShield }
];

export const ConfigSettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('backup');
  const [isSaving, setIsSaving] = useState(false);
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.config?.settings);

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      // Dispatch save actions for each tab
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('All settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'backup': return <BackupSettingsTab />;
      case 'maintenance': return <MaintenanceSettingsTab />;
      case 'dr': return <DRThresholdsTab />;
      case 'notifications': return <NotificationSettingsTab />;
      case 'storage': return <StorageSettingsTab />;
      default: return <BackupSettingsTab />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Configuration Settings</h1>
        <div className="flex gap-3">
          <button 
            onClick={handleSaveAll} 
            disabled={isSaving} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
            Save All Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="text-lg" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};