import React from 'react';
import { FiDollarSign, FiUsers, FiActivity, FiTrendingUp, FiTrendingDown, FiCalendar } from 'react-icons/fi';
import { CurrencyFormatter } from '../shared/CurrencyFormatter';
import './analytics.css';

export const BillingMetricsCards = ({ metrics, loading = false }) => {
    const defaultMetrics = {
        mrr: 0, mrrChange: 0, activeSubscriptions: 0, activeChange: 0,
        totalRevenue: 0, revenueChange: 0, successRate: 0, successRateChange: 0,
        arpu: 0, arpuChange: 0, ltv: 0, ltvChange: 0
    };

    const data = { ...defaultMetrics, ...metrics };

    const cards = [
        { key: 'mrr', label: 'Monthly Recurring Revenue', value: data.mrr, change: data.mrrChange, icon: FiDollarSign, color: '#3b82f6', isCurrency: true },
        { key: 'active', label: 'Active Subscriptions', value: data.activeSubscriptions, change: data.activeChange, icon: FiUsers, color: '#22c55e', isCurrency: false },
        { key: 'revenue', label: 'Total Revenue', value: data.totalRevenue, change: data.revenueChange, icon: FiActivity, color: '#8b5cf6', isCurrency: true },
        { key: 'success', label: 'Success Rate', value: data.successRate, change: data.successRateChange, icon: FiTrendingUp, color: '#f59e0b', isCurrency: false, suffix: '%' },
        { key: 'arpu', label: 'Average Revenue Per User', value: data.arpu, change: data.arpuChange, icon: FiCalendar, color: '#ec4899', isCurrency: true },
        { key: 'ltv', label: 'Customer LTV', value: data.ltv, change: data.ltvChange, icon: FiTrendingUp, color: '#06b6d4', isCurrency: true }
    ];

    if (loading) return <div className="metrics-skeleton"><div className="skeleton skeleton-card"></div><div className="skeleton skeleton-card"></div><div className="skeleton skeleton-card"></div><div className="skeleton skeleton-card"></div></div>;

    return (
        <div className="metrics-cards-grid">
            {cards.map(card => (
                <div key={card.key} className="metric-card" style={{ borderTopColor: card.color }}>
                    <div className="metric-header"><span className="metric-label">{card.label}</span><card.icon className="metric-icon" style={{ color: card.color }} /></div>
                    <div className="metric-value">{card.isCurrency ? <CurrencyFormatter amount={card.value} showCents={false} /> : card.value}{card.suffix || ''}</div>
                    <div className={`metric-change ${card.change >= 0 ? 'positive' : 'negative'}`}>{card.change >= 0 ? <FiTrendingUp /> : <FiTrendingDown />} {Math.abs(card.change)}% from last month</div>
                </div>
            ))}
        </div>
    );
};

export default BillingMetricsCards;