// frontend/src/components/reports/distributions/DistributionTable.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { DistributionStatusBadge } from './DistributionStatusBadge';
import './distributions.css';

export const DistributionTable = ({
    distributions = [],
    onEdit,
    onDelete,
}) => {
    return (
        <div className="distribution-table-container">
            <table className="distribution-table">
                <thead>
                    <tr>
                        <th>List Name</th>
                        <th>Description</th>
                        <th>Recipients</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {distributions.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                No distribution lists found.
                            </td>
                        </tr>
                    ) : (
                        distributions.map((dist) => (
                            <tr key={dist.id}>
                                <td>
                                    <strong style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <FiUsers size={14} color="#2563eb" />
                                        {dist.name}
                                    </strong>
                                </td>
                                <td>{dist.description || '-'}</td>
                                <td>
                                    <span style={{ fontWeight: 600 }}>{dist.recipients?.length || 0}</span> recipients
                                </td>
                                <td>
                                    <DistributionStatusBadge isActive={dist.is_active} />
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            type="button"
                                            className="action-btn edit"
                                            onClick={() => onEdit?.(dist)}
                                            title="Edit"
                                        >
                                            <FiEdit2 size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            className="action-btn delete"
                                            onClick={() => onDelete?.(dist)}
                                            title="Delete"
                                        >
                                            <FiTrash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

DistributionTable.propTypes = {
    distributions: PropTypes.array,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
};

export default DistributionTable;
