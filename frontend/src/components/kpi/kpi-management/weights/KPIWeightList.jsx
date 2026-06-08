import React from 'react';
import { FiEdit, FiTrash2, FiUser, FiCalendar } from 'react-icons/fi';

const KPIWeightList = ({ weights, onEdit, onDelete, readOnly }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Current';
        return new Date(dateString).toLocaleDateString();
    };
    
    return (
        <div className="kpi-weight-list">
            <div className="weight-list-header">
                <span>User</span>
                <span>Weight</span>
                <span>Effective Period</span>
                <span>Status</span>
                {!readOnly && <span>Actions</span>}
            </div>
            <div className="weight-list-items">
                {weights.map(weight => (
                    <div key={weight.id} className="weight-list-item">
                        <div className="weight-user">
                            <FiUser size={14} />
                            <span>{weight.user_full_name || weight.user_email}</span>
                        </div>
                        <div className="weight-value">
                            <strong>{weight.weight}%</strong>
                        </div>
                        <div className="weight-period">
                            <FiCalendar size={12} />
                            <span>
                                {formatDate(weight.effective_from)} - {formatDate(weight.effective_to)}
                            </span>
                        </div>
                        <div className="weight-status">
                            <span className={`status-badge ${weight.is_active ? 'active' : 'inactive'}`}>
                                {weight.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        {!readOnly && (
                            <div className="weight-actions">
                                <button className="edit-btn" onClick={() => onEdit(weight)}>
                                    <FiEdit size={14} />
                                </button>
                                <button className="delete-btn" onClick={() => onDelete(weight.id)}>
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KPIWeightList;