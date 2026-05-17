import React from 'react';
import PropTypes from 'prop-types';
import { renderBillingIcon } from '../shared/BillingIcons';

export const BillingMetricsCards = ({ metrics, loading }) => {
    if (loading) {
        return (
            <div className="metrics-cards-skeleton">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="metric-card-skeleton"></div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Total Revenue',
            value: `KES ${((metrics?.total_revenue || 0) / 100).toLocaleString()}`,
            change: metrics?.revenue_growth,
            icon: renderBillingIcon('totalRevenue', { size: 22 }),
            color: '#2563eb',
        },
        {
            title: 'Active Subscriptions',
            value: metrics?.active_subscriptions || 0,
            change: metrics?.subscription_growth,
            icon: renderBillingIcon('activeSubscriptions', { size: 22 }),
            color: '#10b981',
        },
        {
            title: 'Avg. Revenue Per User',
            value: `KES ${((metrics?.arpu || 0) / 100).toLocaleString()}`,
            change: metrics?.arpu_change,
            icon: renderBillingIcon('revenuePerUser', { size: 22 }),
            color: '#8b5cf6',
        },
        {
            title: 'Payment Success Rate',
            value: `${metrics?.payment_success_rate || 0}%`,
            change: metrics?.success_rate_change,
            icon: renderBillingIcon('paymentSuccessRate', { size: 22 }),
            color: '#f59e0b',
        },
    ];

    return (
        <div className="billing-metrics-cards">
            {cards.map((card, index) => (
                <div key={index} className="metric-card" style={{ borderTopColor: card.color }}>
                    <div className="metric-card-header">
                        <span className="metric-card-icon">{card.icon}</span>
                        <span className="metric-card-title">{card.title}</span>
                    </div>
                    <div className="metric-card-value">{card.value}</div>
                    {card.change !== undefined && (
                        <div className={`metric-card-change ${card.change >= 0 ? 'positive' : 'negative'}`}>
                            {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change)}% from last month
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

BillingMetricsCards.propTypes = {
    metrics: PropTypes.shape({
        total_revenue: PropTypes.number,
        revenue_growth: PropTypes.number,
        active_subscriptions: PropTypes.number,
        subscription_growth: PropTypes.number,
        arpu: PropTypes.number,
        arpu_change: PropTypes.number,
        payment_success_rate: PropTypes.number,
        success_rate_change: PropTypes.number,
    }),
    loading: PropTypes.bool,
};

export default BillingMetricsCards;