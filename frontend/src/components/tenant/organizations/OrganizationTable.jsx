import React from 'react';
import { FiEye, FiEdit, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import OrganizationStatusBadge from './OrganizationStatusBadge';
import { SUBSCRIPTION_TIER_LABELS } from '../../../services/tenant';

const OrganizationTable = ({ organizations, onView, onEdit, onDelete, onToggle, loading }) => {
  if (!organizations || organizations.length === 0) {
    return (
      <div className="org-empty-state">
        <div className="org-empty-icon">🏢</div>
        <p className="org-empty-title">No organizations found</p>
        <p className="org-empty-desc">Try adjusting your filters or create a new organization</p>
      </div>
    );
  }
  const tierBadgeClass = (tier) => {
    if (tier === 'enterprise') return 'org-badge-purple';
    if (tier === 'professional') return 'org-badge-blue';
    if (tier === 'basic') return 'org-badge-yellow';
    return 'org-badge-gray';
  };
  return (
    <div className="org-card" style={{ overflowX: 'auto' }}>
      <table className="org-table">
        <thead className="org-table-head">
          <tr>
            <th>Organization</th>
            <th>Status</th>
            <th>Subscription</th>
            <th>Contact</th>
            <th>Created</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody className="org-table-body">
          {organizations.map((org) => (
            <tr key={org.id}>
              <td>
                <div>
                  <div className="org-font-semibold org-text-sm" style={{ color: '#0f172a' }}>{org.name}</div>
                  <div className="org-text-xs org-text-muted">{org.slug}</div>
                </div>
              </td>
              <td><OrganizationStatusBadge status={org.status} /></td>
              <td>
                <span className={`org-badge ${tierBadgeClass(org.subscription_tier)}`}>
                  {SUBSCRIPTION_TIER_LABELS[org.subscription_tier] || org.subscription_tier}
                </span>
              </td>
              <td>
                <div className="org-text-sm" style={{ color: '#0f172a' }}>{org.contact_email}</div>
                <div className="org-text-xs org-text-muted">{org.contact_phone || 'No phone'}</div>
              </td>
              <td className="org-text-sm org-text-muted">
                {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'N/A'}
              </td>
              <td>
                <div className="org-flex org-gap-2" style={{ justifyContent: 'center' }}>
                  <button
                    className="org-btn org-btn-secondary org-btn-sm"
                    onClick={() => onView && onView(org.id)}
                    disabled={loading}
                    title="View"
                  >
                    <FiEye size={14} />
                  </button>
                  <button
                    className="org-btn org-btn-secondary org-btn-sm"
                    onClick={() => onEdit && onEdit(org.id)}
                    disabled={loading}
                    title="Edit"
                  >
                    <FiEdit size={14} />
                  </button>
                  {org.is_active ? (
                    <button
                      className="org-btn org-btn-warning org-btn-sm"
                      onClick={() => onToggle && onToggle(org.id)}
                      disabled={loading}
                      title="Suspend"
                    >
                      <FiXCircle size={14} />
                    </button>
                  ) : (
                    <button
                      className="org-btn org-btn-success org-btn-sm"
                      onClick={() => onToggle && onToggle(org.id)}
                      disabled={loading}
                      title="Activate"
                    >
                      <FiCheckCircle size={14} />
                    </button>
                  )}
                  <button
                    className="org-btn org-btn-danger org-btn-sm"
                    onClick={() => onDelete && onDelete(org.id)}
                    disabled={loading}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrganizationTable;