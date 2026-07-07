import React, { useState } from 'react';
import { normalizeOrgStatus } from '../../../services/tenant';

export const ProvisioningActions = ({
  orgId,
  status,
  onTrigger,
  onRetry,
  onRollback,
  loading = false,
}) => {
  const [confirm, setConfirm] = useState(null);
  const [forceMode, setForceMode] = useState(false);

  const s = normalizeOrgStatus(status);
  const isPending = s === 'PENDING';
  const isFailed = s === 'FAILED';
  const isProvisioning = s === 'PROVISIONING';
  const isActive = s === 'ACTIVE';

  const canTrigger = isPending;
  const canRetry = isFailed;
  const canRollback = isFailed || isProvisioning;

  const handleConfirm = async () => {
    if (!confirm) return;
    setConfirm(null);
    try {
      if (confirm === 'trigger') await onTrigger?.(orgId, forceMode);
      if (confirm === 'retry') await onRetry?.(orgId, forceMode);
      if (confirm === 'rollback') await onRollback?.(orgId);
    } finally {
      setForceMode(false);
    }
  };

  const confirmConfig = {
    trigger: {
      title: 'Trigger Provisioning',
      body: 'Start the provisioning pipeline for this organization?',
      confirmLabel: 'Yes, Trigger',
      danger: false,
    },
    retry: {
      title: 'Retry Provisioning',
      body: 'Reset to pending and re-run the pipeline. Completed steps are skipped.',
      confirmLabel: 'Yes, Retry',
      danger: false,
    },
    rollback: {
      title: 'Rollback Provisioning',
      body: 'This drops the database schema, removes resource records, and marks the organization FAILED. This cannot be undone.',
      confirmLabel: 'Yes, Rollback',
      danger: true,
    },
  };

  const cfg = confirm ? confirmConfig[confirm] : null;

  return (
    <>
      <div className="prov-actions-bar">
        {canTrigger && (
          <button
            type="button"
            className="org-btn org-btn-primary"
            disabled={loading}
            onClick={() => setConfirm('trigger')}
          >
            {loading ? 'Working...' : 'Trigger Provisioning'}
          </button>
        )}

        {canRetry && (
          <button
            type="button"
            className="org-btn org-btn-primary"
            disabled={loading}
            onClick={() => setConfirm('retry')}
          >
            {loading ? 'Retrying...' : 'Retry Provisioning'}
          </button>
        )}

        {canRollback && (
          <button
            type="button"
            className="org-btn org-btn-danger"
            disabled={loading}
            onClick={() => setConfirm('rollback')}
          >
            Rollback
          </button>
        )}

        {isProvisioning && (
          <span className="prov-actions-note">Provisioning is currently running...</span>
        )}

        {isActive && !canTrigger && (
          <span className="prov-actions-note">Organization is fully provisioned and active.</span>
        )}
      </div>

      {confirm && cfg && (
        <div className="prov-modal-overlay" onClick={() => setConfirm(null)} role="presentation">
          <div className="prov-modal" onClick={(e) => e.stopPropagation()} role="dialog">
            <div className="prov-modal-header">
              <span className="prov-modal-title">{cfg.title}</span>
              <button type="button" className="prov-modal-close" onClick={() => setConfirm(null)}>×</button>
            </div>
            <div className="prov-modal-body">
              <p className={cfg.danger ? 'prov-modal-danger-text' : ''}>{cfg.body}</p>
              {confirm === 'trigger' && isActive && (
                <label className="prov-modal-force-label">
                  <input
                    type="checkbox"
                    checked={forceMode}
                    onChange={(e) => setForceMode(e.target.checked)}
                  />
                  Force override (organization is already active)
                </label>
              )}
            </div>
            <div className="prov-modal-footer">
              <button type="button" className="org-btn org-btn-secondary" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={`org-btn ${cfg.danger ? 'org-btn-danger' : 'org-btn-primary'}`}
                onClick={handleConfirm}
                disabled={loading}
              >
                {cfg.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
