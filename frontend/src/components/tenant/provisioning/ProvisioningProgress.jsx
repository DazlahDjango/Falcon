import React from 'react';
import { normalizeOrgStatus } from '../../../services/tenant';

export const ProvisioningProgress = ({ progress = 0, status, message }) => {
  const normalized = normalizeOrgStatus(status);
  const pct = Math.min(Number(progress) || 0, 100);

  let fillClass = 'prov-progress-fill';
  if (normalized === 'ACTIVE' || normalized === 'COMPLETED') {
    fillClass = 'prov-progress-fill prov-progress-fill-success';
  } else if (normalized === 'FAILED') {
    fillClass = 'prov-progress-fill prov-progress-fill-failed';
  }

  const label = message || {
    ACTIVE: 'Provisioning complete',
    COMPLETED: 'Provisioning complete',
    FAILED: 'Provisioning failed',
    PROVISIONING: 'Provisioning in progress...',
    PENDING: 'Waiting to start...',
  }[normalized] || 'Waiting to start...';

  return (
    <div className="prov-progress-wrap">
      <div className="prov-progress-bar">
        <div className={fillClass} style={{ width: `${pct}%` }} />
      </div>
      <div className="provisioning-progress-percentage">{pct}%</div>
      <div className="provisioning-progress-label">{label}</div>
    </div>
  );
};
