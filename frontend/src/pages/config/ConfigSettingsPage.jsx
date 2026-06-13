import { ConfigSettingsPanel } from '../../components/config/settings/ConfigSettingsPanel';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { FiSettings } from 'react-icons/fi';

export const ConfigSettingsPage = () => {
  return (
    <div className="config-settings-page">
      <div className="mb-4">
        <ConfigBreadcrumb />
      </div>
      <div className="mb-6">
        <h1 className="config-page-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', fontWeight: 700 }}>
          <FiSettings style={{ color: '#2563eb' }} />
          Configuration Settings
        </h1>
        <p className="config-page-subtitle" style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: 4 }}>
          Persisted platform settings — backup, maintenance, DR, notifications, and storage
        </p>
      </div>
      <ConfigSettingsPanel />
    </div>
  );
};
export default ConfigSettingsPage;