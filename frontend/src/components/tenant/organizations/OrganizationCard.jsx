import React from 'react';
import { FiUsers, FiGlobe, FiCalendar, FiArrowRight } from 'react-icons/fi';
import OrganizationStatusBadge from './OrganizationStatusBadge';
import { SUBSCRIPTION_TIER_LABELS } from '../../../services/tenant';

const OrganizationCard = ({ organization, onClick }) => {
  const { name, slug, status, contact_email, created_at, is_onboarded, subscription_tier } = organization || {};
  const tierColors = {
    free: 'org-badge-gray',
    basic: 'org-badge-yellow',
    professional: 'org-badge-blue',
    enterprise: 'org-badge-purple',
  };
  const tierColor = tierColors[subscription_tier] || 'org-badge-gray';
  const date = created_at ? new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
  return (
    <div className="org-card org-card-hover" onClick={() => onClick && onClick(organization)} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="org-flex-between org-mb-4">
        <div>
          <h3 className="org-font-semibold org-text-sm" style={{ color: '#0f172a' }}>{name}</h3>
          <p className="org-text-xs org-text-muted">{slug}</p>
        </div>
        <OrganizationStatusBadge status={status} />
      </div>
      <div className="org-space-y-2 org-text-sm org-text-muted">
        <div className="org-flex org-gap-2">
          <FiUsers size={16} />
          <span>{contact_email || 'No email'}</span>
        </div>
        <div className="org-flex org-gap-2">
          <FiGlobe size={16} />
          <span>{SUBSCRIPTION_TIER_LABELS[subscription_tier] || subscription_tier || 'Free'}</span>
        </div>
        <div className="org-flex org-gap-2">
          <FiCalendar size={16} />
          <span>Created {date}</span>
        </div>
      </div>
      {is_onboarded && (
        <div className="org-mt-4">
          <span className="org-badge org-badge-green">Onboarded</span>
        </div>
      )}
      {onClick && (
        <div className="org-mt-4 org-flex org-flex-center" style={{ justifyContent: 'flex-end' }}>
          <FiArrowRight size={16} style={{ color: '#94a3b8' }} />
        </div>
      )}
    </div>
  );
};

export default OrganizationCard;