import { useState } from 'react';
import { FiPlus, FiTrash2, FiGitBranch } from 'react-icons/fi';
import { DEPENDENCY_TYPE_LABELS, DEPENDENCY_TYPES } from '../../../config/constants/configConstants';

const extractList = (response) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

export const DependencyManager = ({
  dependenciesData,
  apps,
  canEdit,
  onCreate,
  onDelete,
  isCreating,
}) => {
  const dependencies = extractList(dependenciesData);
  const [form, setForm] = useState({
    source_app: '',
    target_app: '',
    dependency_type: DEPENDENCY_TYPES.HARD,
    description: '',
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.source_app || !form.target_app || form.source_app === form.target_app) return;
    const source = apps.find((a) => a.name === form.source_app);
    const target = apps.find((a) => a.name === form.target_app);
    if (!source || !target) return;
    onCreate({
      source_app: source.id,
      target_app: target.id,
      dependency_type: form.dependency_type,
      description: form.description,
    });
    setForm({ source_app: '', target_app: '', dependency_type: DEPENDENCY_TYPES.HARD, description: '' });
  };

  return (
    <div className="config-registry-table-wrap">
      <div className="config-registry-recovery-panel-header">
        <h3 className="config-registry-recovery-panel-title">
          <FiGitBranch style={{ color: '#7c3aed' }} />
          App Dependencies
        </h3>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
          Integrity: restore order constraints between apps
        </p>
      </div>

      {canEdit && (
        <form onSubmit={handleAdd} className="config-registry-deps-form">
          <div>
            <label className="config-registry-form-label">Source (depends on →)</label>
            <select
              value={form.source_app}
              onChange={(e) => setForm({ ...form, source_app: e.target.value })}
              className="config-registry-form-input"
              required
            >
              <option value="">Select app</option>
              {apps.map((a) => (
                <option key={a.id} value={a.name}>{a.display_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="config-registry-form-label">Target (required first)</label>
            <select
              value={form.target_app}
              onChange={(e) => setForm({ ...form, target_app: e.target.value })}
              className="config-registry-form-input"
              required
            >
              <option value="">Select app</option>
              {apps.map((a) => (
                <option key={a.id} value={a.name}>{a.display_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="config-registry-form-label">Type</label>
            <select
              value={form.dependency_type}
              onChange={(e) => setForm({ ...form, dependency_type: e.target.value })}
              className="config-registry-form-input"
            >
              {Object.entries(DEPENDENCY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="config-registry-form-label">Note</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="config-registry-form-input"
              placeholder="Optional"
            />
          </div>
          <button type="submit" disabled={isCreating} className="config-registry-btn-primary">
            <FiPlus /> Add
          </button>
        </form>
      )}

      <table className="config-registry-table">
        <thead>
          <tr>
            <th>Source</th>
            <th>→ Depends on</th>
            <th>Type</th>
            <th>Note</th>
            {canEdit && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {dependencies.length === 0 ? (
            <tr>
              <td colSpan={canEdit ? 5 : 4} className="config-registry-empty">
                No dependencies defined
              </td>
            </tr>
          ) : (
            dependencies.map((dep) => (
              <tr key={dep.id}>
                <td style={{ fontWeight: 500 }}>{dep.source_app_name}</td>
                <td>{dep.target_app_name}</td>
                <td style={{ textTransform: 'capitalize' }}>{dep.dependency_type}</td>
                <td style={{ color: '#6b7280' }}>{dep.description || '—'}</td>
                {canEdit && (
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => onDelete(dep.id)}
                      className="config-registry-btn-secondary"
                      style={{ color: '#dc2626', padding: '0.35rem' }}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
