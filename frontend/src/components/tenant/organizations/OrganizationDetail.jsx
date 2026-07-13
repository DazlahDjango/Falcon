import React, { useEffect, useState } from 'react';
import {
  FiMail, FiPhone, FiMapPin, FiGlobe, FiArrowLeft, FiEdit,
  FiRefreshCw, FiPlay, FiPause, FiSettings,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '../../../hooks/tenant';
import { SUBSCRIPTION_TIER_LABELS, getProvisioningMeta } from '../../../services/tenant';
import OrganizationStatusBadge from './OrganizationStatusBadge';
import './organization.css';

const OrganizationDetail = ({ organizationId, onBack, onEdit }) => {
  const navigate = useNavigate();
  const {
    organization: org,
    loading,
    fetchOne,
    activate,
    suspend,
    onboard,
  } = useOrganization(organizationId, { autoFetch: true });
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOne(organizationId);
    } finally {
      setRefreshing(false);
    }
  };

  const runAction = async (action, confirmMessage) => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await action(organizationId);
      await fetchOne(organizationId);
    } catch (err) {
      setActionError(typeof err === 'string' ? err : err?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (!org || org.status !== 'PROVISIONING') return undefined;
    const interval = setInterval(() => fetchOne(organizationId), 4000);
    return () => clearInterval(interval);
  }, [org?.status, organizationId, fetchOne]);

  if (loading && !org) {
    return (
      <div className="org-container">
        <div className="org-loading">
          <div className="org-loading-spinner" />
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="org-container">
        <div className="org-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="org-text-muted">Organization not found</p>
          <button type="button" className="org-btn org-btn-primary org-mt-4" onClick={onBack}>Go Back</button>
        </div>
      </div>
    );
  }

  const createdDate = org.created_at
    ? new Date(org.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'N/A';
  const onboardedDate = org.onboarded_at
    ? new Date(org.onboarded_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not onboarded';
  const prov = getProvisioningMeta(org);

  return (
    <div className="org-container">
      <div className="org-flex-between org-mb-6">
        <div className="org-flex org-gap-3">
          <button type="button" className="org-btn org-btn-secondary" onClick={onBack}>
            <FiArrowLeft size={16} className="org-gap-2" /> Back
          </button>
          <h1 className="org-title">{org.name}</h1>
        </div>
        <div className="org-flex org-gap-3">
          <button type="button" className="org-btn org-btn-secondary" onClick={handleRefresh} disabled={refreshing || actionLoading}>
            <FiRefreshCw size={16} />
            {!refreshing && ' Refresh'}
          </button>
          {!org.is_onboarded && org.status !== 'PROVISIONING' && (
            <button
              type="button"
              className="org-btn org-btn-primary"
              disabled={actionLoading}
              onClick={() => runAction(onboard, 'Start provisioning for this organization?')}
            >
              <FiPlay size={16} className="org-gap-2" /> Provision
            </button>
          )}
          {org.is_onboarded && !org.is_active && (
            <button
              type="button"
              className="org-btn org-btn-success"
              disabled={actionLoading}
              onClick={() => runAction(activate, `Activate "${org.name}"?`)}
            >
              <FiPlay size={16} className="org-gap-2" /> Activate
            </button>
          )}
          {org.is_active && (
            <button
              type="button"
              className="org-btn org-btn-warning"
              disabled={actionLoading}
              onClick={() => runAction(suspend, `Suspend "${org.name}"?`)}
            >
              <FiPause size={16} className="org-gap-2" /> Suspend
            </button>
          )}
          <button
            type="button"
            className="org-btn org-btn-secondary"
            disabled={actionLoading}
            onClick={() => navigate(`/tenant/provisioning/${org.id}`)}
          >
            <FiSettings size={16} className="org-gap-2" /> Provisioning
          </button>
          <button type="button" className="org-btn org-btn-primary" onClick={() => onEdit && onEdit(org.id)}>
            <FiEdit size={16} className="org-gap-2" /> Edit
          </button>
        </div>
      </div>

      {actionError && (
        <div className="org-card org-mb-4" style={{ borderColor: '#fecaca', color: '#991b1b' }}>
          {actionError}
        </div>
      )}

      {(org.status === 'PROVISIONING' || prov.status) && (
        <div className="org-card org-mb-6">
          <h4 className="org-font-semibold org-text-sm org-mb-3">Provisioning Progress</h4>
          <p className="org-text-sm org-text-muted">{prov.message || prov.step_name || 'Provisioning in progress...'}</p>
          <div className="org-mt-3" style={{ background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${prov.progress || 0}%`, height: '100%', background: '#3b82f6', transition: 'width 0.3s ease' }} />
          </div>
          <p className="org-text-xs org-text-muted org-mt-2">{prov.progress || 0}%</p>
        </div>
      )}

      <div className="org-grid org-grid-cols-2" style={{ marginBottom: '24px' }}>
        <div className="org-card">
          <h4 className="org-font-semibold org-text-sm" style={{ color: '#0f172a', marginBottom: '12px' }}>Organization Info</h4>
          <div className="org-space-y-2">
            <div className="org-flex org-gap-2">
              <span className="org-text-sm org-text-muted" style={{ minWidth: '80px' }}>Status</span>
              <OrganizationStatusBadge status={org.status} />
              {org.is_onboarded && <span className="org-badge org-badge-green">Onboarded</span>}
            </div>
            <div className="org-flex org-gap-2">
              <span className="org-text-sm org-text-muted" style={{ minWidth: '80px' }}>Tier</span>
              <span className="org-badge org-badge-blue">
                {SUBSCRIPTION_TIER_LABELS[org.subscription_tier] || org.subscription_tier}
              </span>
            </div>
            <div className="org-flex org-gap-2">
              <span className="org-text-sm org-text-muted" style={{ minWidth: '80px' }}>Slug</span>
              <span className="org-text-sm" style={{ color: '#0f172a' }}>{org.slug}</span>
            </div>
            <div className="org-flex org-gap-2">
              <span className="org-text-sm org-text-muted" style={{ minWidth: '80px' }}>Created</span>
              <span className="org-text-sm" style={{ color: '#0f172a' }}>{createdDate}</span>
            </div>
            {org.is_onboarded && (
              <div className="org-flex org-gap-2">
                <span className="org-text-sm org-text-muted" style={{ minWidth: '80px' }}>Onboarded</span>
                <span className="org-text-sm" style={{ color: '#0f172a' }}>{onboardedDate}</span>
              </div>
            )}
          </div>
        </div>
        <div className="org-card">
          <h4 className="org-font-semibold org-text-sm" style={{ color: '#0f172a', marginBottom: '12px' }}>Contact Information</h4>
          <div className="org-space-y-2">
            <div className="org-flex org-gap-2">
              <FiMail size={16} style={{ color: '#64748b', minWidth: '20px' }} />
              <span className="org-text-sm" style={{ color: '#0f172a' }}>{org.contact_email || 'N/A'}</span>
            </div>
            <div className="org-flex org-gap-2">
              <FiPhone size={16} style={{ color: '#64748b', minWidth: '20px' }} />
              <span className="org-text-sm" style={{ color: '#0f172a' }}>{org.contact_phone || 'N/A'}</span>
            </div>
            <div className="org-flex org-gap-2">
              <FiMapPin size={16} style={{ color: '#64748b', minWidth: '20px' }} />
              <span className="org-text-sm" style={{ color: '#0f172a' }}>{org.contact_address || 'N/A'}</span>
            </div>
            <div className="org-flex org-gap-2">
              <FiGlobe size={16} style={{ color: '#64748b', minWidth: '20px' }} />
              <span className="org-text-sm" style={{ color: '#0f172a' }}>{org.website || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {org.sector && (
        <div className="org-card org-mb-6">
          <h4 className="org-font-semibold org-text-sm" style={{ color: '#0f172a', marginBottom: '8px' }}>Sector</h4>
          <div className="org-flex org-gap-3">
            <span className="org-badge org-badge-blue">{org.sector.name}</span>
            <span className="org-badge org-badge-gray">{org.sector.sector_type}</span>
          </div>
        </div>
      )}

      {org.domains && org.domains.length > 0 && (
        <div className="org-card">
          <h4 className="org-font-semibold org-text-sm" style={{ color: '#0f172a', marginBottom: '12px' }}>
            Domains ({org.domains.length})
          </h4>
          <div className="org-space-y-2">
            {org.domains.map((domain) => (
              <div key={domain.id} className="org-flex-between" style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span className="org-text-sm" style={{ color: '#0f172a' }}>{domain.domain}</span>
                <div className="org-flex org-gap-2">
                  {domain.is_primary && <span className="org-badge org-badge-yellow">Primary</span>}
                  <OrganizationStatusBadge status={domain.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDetail;
