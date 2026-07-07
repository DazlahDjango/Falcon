import React from 'react';
import { normalizeOrgStatus } from '../../../services/tenant';

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', className: 'prov-status-active', icon: '✓' },
  PENDING: { label: 'Pending', className: 'prov-status-pending', icon: '⏳' },
  PROVISIONING: { label: 'Provisioning', className: 'prov-status-provisioning', icon: '↻' },
  FAILED: { label: 'Failed', className: 'prov-status-failed', icon: '✕' },
  SUSPENDED: { label: 'Suspended', className: 'prov-status-suspended', icon: '⏸' },
  ARCHIVED: { label: 'Archived', className: 'prov-status-archived', icon: '▦' },
  COMPLETED: { label: 'Complete', className: 'prov-status-active', icon: '✓' },
};

export const ProvisioningStatusBadge = ({ status }) => {
  const normalized = normalizeOrgStatus(status);
  const config = STATUS_CONFIG[normalized] || {
    label: status || 'Unknown',
    className: 'prov-status-pending',
    icon: '?',
  };

  return (
    <span className={`prov-status-badge ${config.className}`}>
      {config.icon} {config.label}
    </span>
  );
};
