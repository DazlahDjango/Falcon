import React from 'react';
import { getProvisioningMeta, normalizeOrgStatus } from '../../../services/tenant';
import { SUBSCRIPTION_TIER_LABELS } from '../../../services/tenant';

const STATUS_CLASS = {
  PENDING: 'prov-status-pending',
  PROVISIONING: 'prov-status-provisioning',
  ACTIVE: 'prov-status-active',
  FAILED: 'prov-status-failed',
  SUSPENDED: 'prov-status-suspended',
  ARCHIVED: 'prov-status-archived',
};

export const ProvisioningDashboardCard = ({
  org,
  onTrigger,
  onRetry,
  onRollback,
  onViewDetail,
  actionLoading = false,
}) => {
  if (!org) return null;

  const status = normalizeOrgStatus(org.status);
  const isProvisioning = status === 'PROVISIONING';
  const isFailed = status === 'FAILED';
  const isPending = status === 'PENDING';

  const provMeta = getProvisioningMeta(org);
  const progress = provMeta.progress ?? 0;
  const stepName = provMeta.step_name || provMeta.message;
  const errorMsg = provMeta.error;

  return (
    <div className={`prov-card prov-card-${status.toLowerCase()}`}>
      <div className="prov-card-header">
        <div>
          <div className="prov-card-org-name">{org.name}</div>
          <div className="prov-card-org-slug">/{org.slug}</div>
        </div>
        <span className={`prov-status-badge ${STATUS_CLASS[status] || 'prov-status-pending'}`}>
          {status}
        </span>
      </div>

      <div className="prov-card-meta">
        <span className="prov-card-meta-item">
          <span className="prov-card-meta-label">Tier:</span>
          <span className={`prov-card-tier prov-card-tier-${org.subscription_tier || 'free'}`}>
            {SUBSCRIPTION_TIER_LABELS[org.subscription_tier] || org.subscription_tier || 'Free'}
          </span>
        </span>
        {org.onboarded_at && (
          <span className="prov-card-meta-item">
            <span className="prov-card-meta-label">Onboarded:</span>
            {new Date(org.onboarded_at).toLocaleDateString()}
          </span>
        )}
        {org.created_at && (
          <span className="prov-card-meta-item">
            <span className="prov-card-meta-label">Created:</span>
            {new Date(org.created_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {(isProvisioning || (isFailed && progress > 0)) && (
        <div className="prov-progress-wrap">
          <div className="prov-progress-bar">
            <div
              className={`prov-progress-fill ${isFailed ? 'prov-progress-fill-failed' : ''}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="prov-progress-info">
            <span>{Math.min(progress, 100)}%</span>
            {stepName && <span>{stepName}</span>}
          </div>
        </div>
      )}

      {isFailed && errorMsg && (
        <div className="prov-card-error">{errorMsg}</div>
      )}

      <div className="prov-card-actions">
        <button
          type="button"
          className="org-btn org-btn-secondary org-btn-sm"
          onClick={() => onViewDetail?.(org.id)}
        >
          View Details
        </button>

        {isPending && (
          <button
            type="button"
            className="org-btn org-btn-primary org-btn-sm"
            disabled={actionLoading}
            onClick={() => onTrigger?.(org.id)}
          >
            {actionLoading ? 'Working...' : 'Trigger'}
          </button>
        )}

        {isFailed && (
          <button
            type="button"
            className="org-btn org-btn-primary org-btn-sm"
            disabled={actionLoading}
            onClick={() => onRetry?.(org.id)}
          >
            {actionLoading ? 'Retrying...' : 'Retry'}
          </button>
        )}

        {(isFailed || isProvisioning) && (
          <button
            type="button"
            className="org-btn org-btn-danger org-btn-sm"
            disabled={actionLoading}
            onClick={() => onRollback?.(org.id)}
          >
            Rollback
          </button>
        )}
      </div>
    </div>
  );
};
