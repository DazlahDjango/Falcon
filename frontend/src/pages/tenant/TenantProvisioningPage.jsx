import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProvision } from '../../hooks/tenant/useProvision';
import { useOrganization } from '../../hooks/tenant/useOrganizations';
import { getProvisioningMeta, formatErrorMessage } from '../../services/tenant';
import {
  ProvisioningProgress,
  ProvisioningSteps,
  ProvisioningStatusBadge,
  ProvisioningActions,
  ProvisioningLogs,
} from '../../components/tenant/provisioning';

/**
 * Single-organization provisioning detail page.
 * Routes: /tenant/provisioning/:id, /tenant/organizations/:id/provisioning
 */
export const TenantProvisioningPage = () => {
  const { id, orgId } = useParams();
  const resolvedId = id || orgId;
  const navigate = useNavigate();

  const {
    current,
    loading,
    actionLoading,
    error,
    actionError,
    isCurrentProvisioning,
    isCurrentProvisioned,
    isCurrentFailed,
    currentProgress,
    currentStep,
    getStatus,
    trigger,
    retry,
    rollback,
    clearErrors,
  } = useProvision();

  const { organization: orgDetails } = useOrganization(resolvedId);

  useEffect(() => {
    if (!resolvedId) return;
    getStatus(resolvedId);
  }, [resolvedId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!resolvedId || !isCurrentProvisioning) return undefined;
    const interval = setInterval(() => getStatus(resolvedId), 5000);
    return () => clearInterval(interval);
  }, [resolvedId, isCurrentProvisioning]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTrigger = useCallback(async (targetId, force = false) => {
    await trigger(targetId, force);
    setTimeout(() => getStatus(resolvedId), 800);
  }, [trigger, getStatus, resolvedId]);

  const handleRetry = useCallback(async (targetId, force = false) => {
    await retry(targetId, force);
    setTimeout(() => getStatus(resolvedId), 800);
  }, [retry, getStatus, resolvedId]);

  const handleRollback = useCallback(async (targetId) => {
    await rollback(targetId);
    setTimeout(() => getStatus(resolvedId), 800);
  }, [rollback, getStatus, resolvedId]);

  if (loading && !current) {
    return (
      <div className="tenant-app">
        <div className="org-container">
          <div className="org-loading">
            <div className="org-loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !current) {
    return (
      <div className="tenant-app">
        <div className="org-container">
          <div className="prov-error-banner">
            <span className="prov-error-banner-icon">⚠</span>
            <div>
              <div className="prov-error-banner-title">Failed to load provisioning data</div>
              <div className="prov-error-banner-msg">{formatErrorMessage(error)}</div>
            </div>
          </div>
          <button
            type="button"
            className="org-btn org-btn-secondary org-mt-4"
            onClick={() => { clearErrors(); getStatus(resolvedId); }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const orgName = orgDetails?.name || current?.name || `Organization ${resolvedId}`;
  const orgStatus = current?.status || orgDetails?.status || 'PENDING';
  const provMeta = getProvisioningMeta(current || orgDetails);

  return (
    <div className="tenant-app">
      <div className="org-container">
        <div className="prov-detail-header">
          <div>
            <div className="prov-detail-title-row">
              <button
                type="button"
                className="org-btn org-btn-secondary org-btn-sm"
                onClick={() => navigate(-1)}
              >
                ← Back
              </button>
              <h1 className="prov-detail-title">{orgName}</h1>
              <ProvisioningStatusBadge status={orgStatus} />
            </div>
            <div className="prov-detail-timestamps">
              {current?.created_at && (
                <span><strong>Created:</strong> {new Date(current.created_at).toLocaleString()}</span>
              )}
              {provMeta.started_at && (
                <span><strong>Started:</strong> {new Date(provMeta.started_at).toLocaleString()}</span>
              )}
              {provMeta.updated_at && orgStatus === 'ACTIVE' && (
                <span><strong>Completed:</strong> {new Date(provMeta.updated_at).toLocaleString()}</span>
              )}
            </div>
          </div>
        </div>

        {isCurrentProvisioned && (
          <div className="prov-success-banner">
            <div className="prov-success-banner-icon">✓</div>
            <div>
              <div className="prov-success-banner-title">Provisioning Complete</div>
              <div className="prov-success-banner-sub">
                This organization is fully provisioned and active.
              </div>
            </div>
          </div>
        )}

        {isCurrentFailed && provMeta.error && (
          <div className="prov-error-banner">
            <span className="prov-error-banner-icon">✕</span>
            <div>
              <div className="prov-error-banner-title">Provisioning Failed</div>
              <div className="prov-error-banner-msg">{formatErrorMessage(provMeta.error)}</div>
            </div>
          </div>
        )}

        {actionError && (
          <div className="prov-error-banner">
            <span className="prov-error-banner-icon">⚠</span>
            <div>
              <div className="prov-error-banner-title">Action Failed</div>
              <div className="prov-error-banner-msg">{formatErrorMessage(actionError)}</div>
            </div>
          </div>
        )}

        <div className="prov-detail-card org-mb-4">
          <div className="prov-detail-card-title">Provisioning Actions</div>
          <div className="prov-detail-card-body">
            <ProvisioningActions
              orgId={resolvedId}
              status={orgStatus}
              onTrigger={handleTrigger}
              onRetry={handleRetry}
              onRollback={handleRollback}
              loading={actionLoading}
            />
          </div>
        </div>

        <div className="prov-detail-card org-mb-4">
          <div className="prov-detail-card-title">Progress</div>
          <div className="prov-detail-card-body">
            <ProvisioningProgress
              progress={currentProgress ?? provMeta.progress ?? 0}
              status={orgStatus}
              message={
                isCurrentProvisioning && (currentStep || provMeta.step_name)
                  ? `Running: ${currentStep || provMeta.step_name}`
                  : provMeta.message || null
              }
            />
          </div>
        </div>

        <div className="prov-detail-card org-mb-4">
          <div className="prov-detail-card-title">Provisioning Steps</div>
          <div className="prov-detail-card-body">
            <ProvisioningSteps provMeta={provMeta} orgStatus={orgStatus} />
          </div>
        </div>

        <div className="prov-detail-card">
          <div className="prov-detail-card-title">Provisioning Log</div>
          <ProvisioningLogs statusMeta={provMeta} />
        </div>
      </div>
    </div>
  );
};

export default TenantProvisioningPage;
