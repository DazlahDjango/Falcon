import { useState, useEffect, useCallback } from 'react';
import { FiDatabase, FiHardDrive, FiShield, FiBell, FiTarget, FiSave, FiRefreshCw, FiRotateCcw, FiAlertCircle } from 'react-icons/fi';
import { BackupSettingsTab } from './BackupSettingsTab';
import { MaintenanceSettingsTab } from './MaintenanceSettingsTab';
import { DRThresholdsTab } from './DRThresholdsTab';
import { NotificationSettingsTab } from './NotificationSettingsTab';
import { StorageSettingsTab } from './StorageSettingsTab';
import { useConfigSettings, useConfigPermissions } from '../../../hooks/config';

const TABS = [
  { id: 'backup', label: 'Backup Settings', icon: FiDatabase, section: 'backup' },
  { id: 'maintenance', label: 'Maintenance', icon: FiHardDrive, section: 'maintenance' },
  { id: 'dr', label: 'DR Thresholds', icon: FiTarget, section: 'dr' },
  { id: 'notifications', label: 'Notifications', icon: FiBell, section: 'notifications' },
  { id: 'storage', label: 'Storage', icon: FiShield, section: 'storage' },
];

const emptySections = () => ({
  backup: {},
  maintenance: {},
  dr: {},
  notifications: {},
  storage: {},
  alert_thresholds: {},
});

export const ConfigSettingsPanel = () => {
  const [activeTab, setActiveTab] = useState('backup');
  const [draftSections, setDraftSections] = useState(emptySections);
  const [dirty, setDirty] = useState(false);
  const { isSuperAdmin } = useConfigPermissions();
  const canEdit = isSuperAdmin;
  const {
    settings,
    isLoading,
    isSaving,
    isResetting,
    saveAll,
    resetToDefaults,
    refetch,
  } = useConfigSettings();

  useEffect(() => {
    if (settings) {
      setDraftSections({
        backup: settings.backup ?? {},
        maintenance: settings.maintenance ?? {},
        dr: settings.dr ?? {},
        notifications: settings.notifications ?? {},
        storage: settings.storage ?? {},
        alert_thresholds: settings.alert_thresholds ?? {},
      });
      setDirty(false);
    }
  }, [settings]);

  const updateSection = useCallback((section, data) => {
    setDraftSections((prev) => ({ ...prev, [section]: data }));
    setDirty(true);
  }, []);

  const handleSaveAll = async () => {
    if (!canEdit) return;
    await saveAll(draftSections);
    setDirty(false);
  };

  const handleReset = async () => {
    if (!canEdit || !window.confirm('Reset all settings to platform defaults?')) return;
    await resetToDefaults();
    setDirty(false);
  };

  const tabProps = { canEdit, onSectionChange: updateSection, sections: draftSections };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'backup': return <BackupSettingsTab {...tabProps} />;
      case 'maintenance': return <MaintenanceSettingsTab {...tabProps} />;
      case 'dr': return <DRThresholdsTab {...tabProps} />;
      case 'notifications': return <NotificationSettingsTab {...tabProps} />;
      case 'storage': return <StorageSettingsTab {...tabProps} />;
      default: return <BackupSettingsTab {...tabProps} />;
    }
  };

  if (isLoading && !settings) {
    return <div className="config-settings-skeleton" />;
  }

  return (
    <div className="config-settings-panel">
      <div className="config-settings-panel-header">
        <div>
          <h2 className="config-settings-panel-title">Platform Settings</h2>
          {settings?.version != null && (
            <p className="config-settings-meta">
              Version {settings.version}
              {settings.updated_at && ` · Last updated ${new Date(settings.updated_at).toLocaleString()}`}
              {dirty && ' · Unsaved changes'}
            </p>
          )}
        </div>
        <div className="config-settings-actions">
          <button type="button" onClick={() => refetch()} className="config-settings-btn-secondary">
            <FiRefreshCw /> Reload
          </button>
          {canEdit && (
            <>
              <button
                type="button"
                onClick={handleReset}
                disabled={isResetting || isSaving}
                className="config-settings-btn-secondary config-settings-btn-danger"
              >
                <FiRotateCcw /> Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving || !dirty}
                className="config-settings-btn-primary"
              >
                {isSaving ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                Save All Changes
              </button>
            </>
          )}
        </div>
      </div>

      {!canEdit && (
        <div className="config-settings-readonly-banner">
          <FiAlertCircle />
          Read-only mode — only Super Admins can modify persisted system settings (Confidentiality).
        </div>
      )}

      <div className="config-settings-tabs-panel">
        <div className="config-settings-tabs-nav">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`config-settings-tab ${activeTab === tab.id ? 'config-settings-tab--active' : ''}`}
              >
                <Icon />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="config-settings-tab-content">{renderTabContent()}</div>
      </div>
    </div>
  );
};
