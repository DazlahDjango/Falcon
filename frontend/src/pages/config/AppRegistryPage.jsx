import { useState } from 'react';
import { FiRefreshCw, FiDatabase, FiAlertCircle } from 'react-icons/fi';
import { ConfigBreadcrumb } from '../../components/config/common/ConfigBreadcrumb';
import { AppRegistryTable } from '../../components/config/registry/AppRegistryTable';
import { AppEditModal } from '../../components/config/registry/AppEditModal';
import { RecoverySequencePanel } from '../../components/config/registry/RecoverySequencePanel';
import { DependencyManager } from '../../components/config/registry/DependencyManager';
import { useRegistry, useConfigPermissions } from '../../hooks/config';

const extractApps = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const AppRegistryPage = () => {
  const [editingApp, setEditingApp] = useState(null);
  const [activeTab, setActiveTab] = useState('registry');
  const { canManageRegistry, canSyncRegistry, canEditRegistryDeps, isSuperAdmin } = useConfigPermissions();
  const {
    useRegisteredApps,
    useRecoverySequence,
    usePriorityOrder,
    useAppDependencies,
    syncRegistry,
    updateApp,
    createDependency,
    deleteDependency,
  } = useRegistry();

  const { data: appsResponse, isLoading, refetch, isError } = useRegisteredApps(
    { registered_only: 'true', ordering: 'recovery_priority' },
    { refetchInterval: 60000 }
  );
  const { data: recoveryData, isLoading: recoveryLoading } = useRecoverySequence();
  const { data: priorityData, isLoading: priorityLoading } = usePriorityOrder();
  const { data: depsData, refetch: refetchDeps } = useAppDependencies();

  const apps = extractApps(appsResponse);
  const criticalCount = apps.filter((a) => a.is_critical).length;

  const handleSync = async () => {
    if (!window.confirm('Sync all apps with canonical registry definitions? This overwrites drift from manual edits.')) {
      return;
    }
    try {
      await syncRegistry.mutateAsync();
      refetch();
      refetchDeps();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveApp = async (formData) => {
    if (!editingApp) return;
    try {
      await updateApp.mutateAsync({ appId: editingApp.id, data: formData });
      setEditingApp(null);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDep = async (data) => {
    try {
      await createDependency.mutateAsync(data);
      refetchDeps();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDep = async (id) => {
    if (!window.confirm('Remove this dependency?')) return;
    try {
      await deleteDependency.mutateAsync(id);
      refetchDeps();
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { id: 'registry', label: 'Registered Apps' },
    { id: 'recovery', label: 'Recovery Order' },
    { id: 'dependencies', label: 'Dependencies' },
  ];

  return (
    <div className="config-registry-page">
      <div className="config-registry-header">
        <div>
          <ConfigBreadcrumb />
          <h1 className="config-registry-title">
            <FiDatabase className="config-registry-title-icon" />
            App Registry
          </h1>
          <p className="config-registry-subtitle">
            CIA-aligned registry: Confidentiality (super-admin writes), Integrity (canonical sync),
            Availability (criticality, RPO/RTO, recovery order).
          </p>
        </div>
        <div className="config-registry-actions">
          <button type="button" onClick={() => refetch()} className="config-registry-btn-secondary">
            <FiRefreshCw /> Refresh
          </button>
          {canSyncRegistry && (
            <button
              type="button"
              onClick={handleSync}
              disabled={syncRegistry.isPending}
              className="config-registry-btn-primary"
            >
              <FiRefreshCw className={syncRegistry.isPending ? 'animate-spin' : ''} />
              Sync Registry
            </button>
          )}
        </div>
      </div>

      <div className="config-registry-stats">
        <div className="config-registry-stat-card">
          <div className="config-registry-stat-label">Registered</div>
          <div className="config-registry-stat-value">{apps.length}</div>
        </div>
        <div className="config-registry-stat-card config-registry-stat-card--critical">
          <div className="config-registry-stat-label config-registry-stat-label--critical">Critical (A)</div>
          <div className="config-registry-stat-value config-registry-stat-value--critical">{criticalCount}</div>
        </div>
        <div className="config-registry-stat-card">
          <div className="config-registry-stat-label">Dependencies (I)</div>
          <div className="config-registry-stat-value">{extractApps(depsData).length}</div>
        </div>
        <div className="config-registry-stat-card">
          <div className="config-registry-stat-label">Access (C)</div>
          <div className="config-registry-stat-value" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {isSuperAdmin ? 'Super Admin' : 'Client Admin (read)'}
          </div>
        </div>
      </div>

      {!canManageRegistry && (
        <div className="config-registry-alert config-registry-alert--warning">
          <FiAlertCircle />
          Registry edits and sync require Super Admin role (Confidentiality control).
        </div>
      )}

      {isError && (
        <div className="config-registry-alert config-registry-alert--error">
          Failed to load registry. Check your permissions and API connection.
        </div>
      )}

      <div className="config-registry-tabs-panel">
        <div className="config-registry-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`config-registry-tab ${activeTab === tab.id ? 'config-registry-tab--active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="config-registry-tab-content">
          {activeTab === 'registry' && (
            isLoading ? (
              <div className="config-registry-skeleton" />
            ) : (
              <AppRegistryTable apps={apps} canEdit={canManageRegistry} onEdit={setEditingApp} />
            )
          )}
          {activeTab === 'recovery' && (
            <RecoverySequencePanel
              recoveryData={recoveryData}
              priorityData={priorityData}
              isLoading={recoveryLoading || priorityLoading}
            />
          )}
          {activeTab === 'dependencies' && (
            <DependencyManager
              dependenciesData={depsData}
              apps={apps}
              canEdit={canEditRegistryDeps}
              onCreate={handleCreateDep}
              onDelete={handleDeleteDep}
              isCreating={createDependency.isPending}
            />
          )}
        </div>
      </div>

      {editingApp && (
        <AppEditModal
          app={editingApp}
          onClose={() => setEditingApp(null)}
          onSave={handleSaveApp}
          isSaving={updateApp.isPending}
        />
      )}
    </div>
  );
};
export default AppRegistryPage;