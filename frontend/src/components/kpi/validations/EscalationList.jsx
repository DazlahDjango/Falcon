import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiUser, FiTarget } from 'react-icons/fi';
import KPIStatusBadge from '../common/KPIStatusBadge';
import KPIEmptyState from '../common/KPIEmptyState';

const EscalationList = ({ escalations, loading, onViewDetail }) => {
    if (loading) {
        return <div className="kpi-loading-container">Loading escalations...</div>;
    }

    if (!escalations || escalations.length === 0) {
        return (
            <KPIEmptyState 
                icon={<FiAlertCircle size={40} />}
                title="No Escalations"
                description="There are no escalations to display."
            />
        );
    }

    return (
        <div className="kpi-escalation-list">
            {escalations.map(escalation => (
                <div 
                    key={escalation.id} 
                    className="kpi-escalation-item"
                    onClick={() => onViewDetail?.(escalation)}
                    style={{ cursor: onViewDetail ? 'pointer' : 'default' }}
                >
                    <div className="kpi-escalation-item-header">
                        <div className="kpi-escalation-item-title">
                            <FiTarget size={14} style={{ marginRight: '8px' }} />
                            {escalation.actual_kpi}
                        </div>
                        <KPIStatusBadge status={escalation.status} />
                    </div>
                    
                    <div className="kpi-escalation-item-meta">
                        <span>From: {escalation.escalated_by_email}</span>
                        <span>To: {escalation.escalated_to_email}</span>
                        <span>Date: {new Date(escalation.escalated_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div style={{ fontSize: '0.875rem', color: 'var(--kpi-gray-700)' }}>
                        <strong>Reason:</strong> {escalation.reason}
                    </div>
                    
                    {escalation.status === 'RESOLVED' && escalation.resolution && (
                        <div className="kpi-escalation-resolution">
                            <FiCheckCircle size={12} style={{ marginRight: '4px' }} />
                            Resolution: {escalation.resolution}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default EscalationList;