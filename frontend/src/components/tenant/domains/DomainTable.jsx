// components/tenant/domains/DomainTable.jsx
import React from 'react';
import { FiEye, FiEdit, FiTrash2, FiRefreshCw, FiStar, FiCheckCircle } from 'react-icons/fi';
import DomainStatusBadge from './DomainStatusBadge';

const DomainTable = ({ domains, onView, onEdit, onDelete, onVerify, onSetPrimary, onRenewSSL, loading }) => {
  if (!domains || domains.length === 0) {
    return (
      <div className="domain-empty-state">
        <div className="domain-empty-icon">🌐</div>
        <p className="domain-empty-title">No domains found</p>
        <p className="domain-empty-desc">Add your first domain to get started</p>
      </div>
    );
  }

  return (
    <div className="domain-card" style={{ overflowX: 'auto' }}>
      <table className="domain-table">
        <thead className="domain-table-head">
          <tr>
            <th>Domain</th>
            <th>Status</th>
            <th>SSL</th>
            <th>Primary</th>
            <th>Created</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody className="domain-table-body">
          {domains.map((domain) => {
            const sslValid = domain.ssl_expires_at ? new Date(domain.ssl_expires_at) > new Date() : false;
            const sslExpiry = domain.ssl_expires_at ? new Date(domain.ssl_expires_at).toLocaleDateString() : 'N/A';
            return (
              <tr key={domain.id}>
                <td>
                  <div className="domain-font-semibold domain-text-sm" style={{ color: '#0f172a' }}>{domain.domain}</div>
                </td>
                <td><DomainStatusBadge status={domain.status} /></td>
                <td>
                  <div className="domain-flex domain-gap-2">
                    {domain.ssl_issued_at ? (
                      <>
                        <span className={`domain-badge ${sslValid ? 'domain-badge-green' : 'domain-badge-orange'}`}>
                          {sslValid ? 'Valid' : 'Expired'}
                        </span>
                        <span className="domain-text-xs domain-text-muted">{sslExpiry}</span>
                      </>
                    ) : (
                      <span className="domain-badge domain-badge-gray">Not issued</span>
                    )}
                  </div>
                </td>
                <td>
                  {domain.is_primary ? (
                    <span className="domain-badge domain-badge-yellow"><FiStar size={12} style={{ marginRight: '4px' }} /> Primary</span>
                  ) : (
                    <span className="domain-text-xs domain-text-muted">—</span>
                  )}
                </td>
                <td className="domain-text-sm domain-text-muted">
                  {domain.created_at ? new Date(domain.created_at).toLocaleDateString() : 'N/A'}
                </td>
                <td>
                  <div className="domain-flex domain-gap-2" style={{ justifyContent: 'center' }}>
                    <button
                      className="domain-btn domain-btn-secondary domain-btn-sm"
                      onClick={() => onView && onView(domain.id)}
                      disabled={loading}
                      title="View"
                    >
                      <FiEye size={14} />
                    </button>
                    <button
                      className="domain-btn domain-btn-secondary domain-btn-sm"
                      onClick={() => onEdit && onEdit(domain.id)}
                      disabled={loading}
                      title="Edit"
                    >
                      <FiEdit size={14} />
                    </button>
                    {domain.status === 'PENDING' && (
                      <button
                        className="domain-btn domain-btn-warning domain-btn-sm"
                        onClick={() => onVerify && onVerify(domain.id)}
                        disabled={loading}
                        title="Verify"
                      >
                        <FiRefreshCw size={14} />
                      </button>
                    )}
                    {domain.status === 'ACTIVE' && !domain.is_primary && (
                      <button
                        className="domain-btn domain-btn-primary domain-btn-sm"
                        onClick={() => onSetPrimary && onSetPrimary(domain.id)}
                        disabled={loading}
                        title="Set Primary"
                      >
                        <FiStar size={14} />
                      </button>
                    )}
                    {domain.status === 'ACTIVE' && (
                      <button
                        className="domain-btn domain-btn-success domain-btn-sm"
                        onClick={() => onRenewSSL && onRenewSSL(domain.id)}
                        disabled={loading}
                        title="Renew SSL"
                      >
                        <FiCheckCircle size={14} />
                      </button>
                    )}
                    <button
                      className="domain-btn domain-btn-danger domain-btn-sm"
                      onClick={() => onDelete && onDelete(domain.id)}
                      disabled={loading}
                      title="Delete"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DomainTable;