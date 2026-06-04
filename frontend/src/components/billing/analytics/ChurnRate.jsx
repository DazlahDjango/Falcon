import React from 'react';
import { FiTrendingDown, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './analytics.css';

export const ChurnRate = ({ churnRate = 0, previousChurn = 0, revenueChurn = 0, loading = false }) => {
    const change = previousChurn ? churnRate - previousChurn : 0;
    const isImproving = change < 0;
    const isHighRisk = churnRate > 10;

    if (loading) return <div className="churn-skeleton"><div className="skeleton skeleton-title"></div><div className="skeleton skeleton-line"></div></div>;

    return (
        <div className="churn-card">
            <div className="churn-header">
                <div className="churn-title">Customer Churn Rate</div>
                {isHighRisk && <div className="churn-warning"><FiAlertTriangle /> High Churn Risk</div>}
            </div>
            <div className="churn-value">{churnRate.toFixed(1)}%<span className={`churn-change ${isImproving ? 'improving' : 'worsening'}`}>{isImproving ? <FiTrendingDown /> : <FiTrendingUp />} {Math.abs(change).toFixed(1)}% vs last month</span></div>
            <div className="churn-details">
                <div className="detail"><span>Revenue Churn</span><span>{revenueChurn.toFixed(1)}%</span></div>
                <div className="detail"><span>Industry Avg</span><span>5-7%</span></div>
                <div className="detail"><span>Target</span><span>&lt;5%</span></div>
            </div>
            <div className="churn-progress"><div className="progress-bar" style={{ width: `${Math.min(churnRate * 10, 100)}%`, background: isHighRisk ? '#dc2626' : isImproving ? '#22c55e' : '#f59e0b' }}></div></div>
            <div className="churn-note">{isHighRisk ? 'High churn rate detected. Consider retention campaigns.' : churnRate > 5 ? 'Churn rate above target. Monitor closely.' : 'Healthy churn rate. Good retention.'}</div>
        </div>
    );
};

export default ChurnRate;