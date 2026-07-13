// components/tenant/resources/ResourceResetModal.jsx
import React, { useState } from 'react';
import { FiX, FiRefreshCw, FiAlertCircle, FiCamera } from 'react-icons/fi';
import { useResources } from '../../../hooks/tenant';

const ResourceResetModal = ({ resource, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snapshotBeforeReset, setSnapshotBeforeReset] = useState(true);
  const { reset, fetchOne, snapshot } = useResources({ autoFetch: false });

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    try {
      // Optionally take a snapshot before resetting to preserve history
      if (snapshotBeforeReset) {
        await snapshot(resource.id, 'manual', `pre-reset-${new Date().toISOString()}`);
      }
      await reset(resource.id);
      const updated = await fetchOne(resource.id);
      if (onSuccess) onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resource-modal-overlay" onClick={onClose}>
      <div className="resource-modal" onClick={(e) => e.stopPropagation()}>
        <div className="resource-modal-header">
          <h3 className="resource-modal-title">Reset Resource Usage</h3>
          <button className="resource-modal-close" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        <div className="resource-space-y-4">
          <div style={{ background: '#fef9c3', padding: '16px', borderRadius: '8px', border: '1px solid #fde68a' }}>
            <div className="resource-flex resource-gap-2">
              <FiAlertCircle size={20} style={{ color: '#92400e' }} />
              <div>
                <p className="resource-text-sm" style={{ color: '#92400e', fontWeight: 500 }}>
                  Reset {resource?.resource_type_display || resource?.resource_type}
                </p>
                <p className="resource-text-xs" style={{ color: '#92400e' }}>
                  Current: {resource?.current_value} / Limit: {resource?.limit_value}
                </p>
                <p className="resource-text-xs" style={{ color: '#92400e' }}>
                  This will reset the current usage to 0. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Snapshot toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
            <input
              type="checkbox"
              checked={snapshotBeforeReset}
              onChange={(e) => setSnapshotBeforeReset(e.target.checked)}
              disabled={loading}
              style={{ width: '16px', height: '16px', accentColor: '#6366f1' }}
            />
            <FiCamera size={14} style={{ color: '#6366f1' }} />
            Take a usage snapshot before resetting (preserves history)
          </label>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div className="resource-flex resource-gap-3" style={{ justifyContent: 'flex-end' }}>
            <button className="resource-btn resource-btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="resource-btn resource-btn-warning" onClick={handleReset} disabled={loading}>
              {loading ? (
                <>
                  <span className="resource-loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', display: 'inline-block', marginRight: '8px' }}></span>
                  {snapshotBeforeReset ? 'Snapshotting & Resetting...' : 'Resetting...'}
                </>
              ) : (
                <>
                  <FiRefreshCw size={14} style={{ marginRight: '6px' }} />
                  Reset Usage
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceResetModal;