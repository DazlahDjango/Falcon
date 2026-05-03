// frontend/src/components/tenant/domains/DomainListTable.jsx
import React from 'react';
import { DomainStatusBadge } from './DomainStatusBadge';
import { DomainPrimaryBadge } from './DomainPrimaryBadge';
import { DomainSSLBadge } from './DomainSSLBadge';
import './domains.css';

export const DomainListTable = ({ domains, onVerify, onSetPrimary, onDelete, onViewDetails, loading = false }) => {
    if (loading) {
        return (
            <div className="domain-table-container">
                <div className="text-center p-8 text-gray-500">Loading domains...</div>
            </div>
        );
    }

    if (!domains || domains.length === 0) {
        return (
            <div className="domain-table-container">
                <div className="text-center p-8 text-gray-500">No domains configured</div>
            </div>
        );
    }

    return (
        <div className="domain-table-container">
            <div className="overflow-x-auto">
                <table className="domain-table">
                    <thead>
                        <tr>
                            <th>Domain</th>
                            <th>Status</th>
                            <th>Primary</th>
                            <th>SSL</th>
                            <th>Verified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {domains.map((domain) => (
                            <tr key={domain.id} onClick={() => onViewDetails?.(domain.id)} style={{ cursor: 'pointer' }}>
                                <td className="font-medium">{domain.domain}</td>
                                <td><DomainStatusBadge status={domain.status} /></td>
                                <td>{domain.is_primary && <DomainPrimaryBadge />}</td>
                                <td><DomainSSLBadge expiryDate={domain.ssl_expires_at} /></td>
                                <td>{domain.verified_at ? new Date(domain.verified_at).toLocaleDateString() : '-'}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-2">
                                        {domain.status === 'pending' && (
                                            <button
                                                onClick={() => onVerify?.(domain.id)}
                                                className="domain-btn domain-btn-primary domain-btn-sm"
                                            >
                                                Verify
                                            </button>
                                        )}
                                        {!domain.is_primary && domain.status === 'active' && (
                                            <button
                                                onClick={() => onSetPrimary?.(domain.id)}
                                                className="domain-btn domain-btn-success domain-btn-sm"
                                            >
                                                Set Primary
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onDelete?.(domain.id)}
                                            className="domain-btn domain-btn-danger domain-btn-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};