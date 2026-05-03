// frontend/src/components/tenant/domains/DomainCard.jsx
import React from 'react';
import { DomainStatusBadge } from './DomainStatusBadge';
import { DomainPrimaryBadge } from './DomainPrimaryBadge';
import { DomainSSLBadge } from './DomainSSLBadge';
import './domains.css';

export const DomainCard = ({ domain, onVerify, onSetPrimary, onDelete }) => {
    const isPrimaryCard = domain.is_primary;

    return (
        <div className={`domain-card ${isPrimaryCard ? 'domain-card-primary' : ''}`}>
            <div className="domain-card-header">
                <div className="domain-card-domain">{domain.domain}</div>
                <div className="domain-card-actions">
                    {domain.status === 'pending' && (
                        <button
                            onClick={() => onVerify?.(domain.id)}
                            className="domain-btn domain-btn-primary domain-btn-sm"
                            title="Verify Domain"
                        >
                            Verify
                        </button>
                    )}
                    {!domain.is_primary && domain.status === 'active' && (
                        <button
                            onClick={() => onSetPrimary?.(domain.id)}
                            className="domain-btn domain-btn-success domain-btn-sm"
                            title="Set as Primary"
                        >
                            Primary
                        </button>
                    )}
                    <button
                        onClick={() => onDelete?.(domain.id)}
                        className="domain-btn domain-btn-danger domain-btn-sm"
                        title="Delete Domain"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <DomainStatusBadge status={domain.status} />
                {domain.is_primary && <DomainPrimaryBadge />}
            </div>

            <div className="domain-card-details">
                <div className="domain-card-detail">
                    <span className="domain-card-detail-label">SSL:</span>
                    <span className="domain-card-detail-value">
                        <DomainSSLBadge expiryDate={domain.ssl_expires_at} />
                    </span>
                </div>
                {domain.verified_at && (
                    <div className="domain-card-detail">
                        <span className="domain-card-detail-label">Verified:</span>
                        <span className="domain-card-detail-value">
                            {new Date(domain.verified_at).toLocaleDateString()}
                        </span>
                    </div>
                )}
                {domain.ssl_expires_at && (
                    <div className="domain-card-detail">
                        <span className="domain-card-detail-label">SSL Expires:</span>
                        <span className="domain-card-detail-value">
                            {new Date(domain.ssl_expires_at).toLocaleDateString()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};