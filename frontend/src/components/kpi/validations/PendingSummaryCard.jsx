import React from 'react';
import { FiAlertCircle, FiClock, FiUsers, FiTarget } from 'react-icons/fi';

const PendingSummaryCard = ({ summary }) => {
    if (!summary) return null;

    return (
        <div className="kpi-pending-summary">
            <div className="kpi-pending-summary-header">
                <div className="kpi-pending-summary-title">
                    <FiAlertCircle size={20} />
                    Pending Validations Summary
                </div>
                <div className="kpi-pending-summary-count">
                    {summary.pending_count || 0}
                </div>
            </div>
            
            <div className="kpi-pending-summary-stats">
                {summary.oldest_pending && (
                    <div className="kpi-pending-summary-stat">
                        <div className="kpi-pending-summary-stat-label">
                            <FiClock size={12} /> Oldest Pending
                        </div>
                        <div className="kpi-pending-summary-stat-value">
                            {summary.oldest_pending.days_old} days
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--kpi-gray-500)' }}>
                            {summary.oldest_pending.kpi} - {summary.oldest_pending.user}
                        </div>
                    </div>
                )}
                
                {summary.by_kpi && summary.by_kpi.length > 0 && (
                    <div className="kpi-pending-summary-stat">
                        <div className="kpi-pending-summary-stat-label">
                            <FiTarget size={12} /> By KPI
                        </div>
                        <div style={{ fontSize: '0.75rem' }}>
                            {summary.by_kpi.slice(0, 3).map(item => (
                                <div key={item.kpi}>{item.kpi}: {item.count}</div>
                            ))}
                        </div>
                    </div>
                )}
                
                {summary.by_user && summary.by_user.length > 0 && (
                    <div className="kpi-pending-summary-stat">
                        <div className="kpi-pending-summary-stat-label">
                            <FiUsers size={12} /> By User
                        </div>
                        <div style={{ fontSize: '0.75rem' }}>
                            {summary.by_user.slice(0, 3).map(item => (
                                <div key={item.user}>{item.user.split('@')[0]}: {item.count}</div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingSummaryCard;