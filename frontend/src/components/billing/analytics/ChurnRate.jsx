import React from 'react';
import PropTypes from 'prop-types';

export const ChurnRate = ({ churnRate, newCustomers, lostCustomers, loading }) => {
    if (loading) {
        return <div className="churn-rate-skeleton">Loading...</div>;
    }

    const getChurnLevel = () => {
        if (churnRate <= 2) return 'good';
        if (churnRate <= 5) return 'warning';
        return 'critical';
    };

    const level = getChurnLevel();

    return (
        <div className="churn-rate">
            <div className="churn-rate-header">
                <span className="churn-rate-title">Churn Rate</span>
                <span className="churn-rate-icon">📉</span>
            </div>
            <div className={`churn-rate-value churn-rate-${level}`}>
                {churnRate}%
            </div>
            <div className="churn-rate-stats">
                <div className="churn-stat">
                    <span className="churn-stat-label">New This Month</span>
                    <span className="churn-stat-value positive">+{newCustomers || 0}</span>
                </div>
                <div className="churn-stat">
                    <span className="churn-stat-label">Lost This Month</span>
                    <span className="churn-stat-value negative">-{lostCustomers || 0}</span>
                </div>
            </div>
            <div className="churn-rate-footer">
                {level === 'good' && <span>✅ Healthy retention rate</span>}
                {level === 'warning' && <span>⚠️ Monitor churn closely</span>}
                {level === 'critical' && <span>🔴 High churn rate - action needed</span>}
            </div>
        </div>
    );
};

ChurnRate.propTypes = {
    churnRate: PropTypes.number.isRequired,
    newCustomers: PropTypes.number,
    lostCustomers: PropTypes.number,
    loading: PropTypes.bool,
};

export default ChurnRate;