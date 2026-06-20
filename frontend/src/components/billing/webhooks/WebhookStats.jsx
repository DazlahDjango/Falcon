import React from 'react';
import PropTypes from 'prop-types';
import renderBillingIcon from '../shared/BillingIcons';

export const WebhookStats = ({ stats, loading }) => {
    if (loading) {
        return (
            <div className="webhook-stats-skeleton">
                <div className="stat-card-skeleton"></div>
                <div className="stat-card-skeleton"></div>
                <div className="stat-card-skeleton"></div>
                <div className="stat-card-skeleton"></div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    const statCards = [
        { label: 'Total Events', value: stats.total, icon: renderBillingIcon('totalEvents', { size: 22 }), color: '#2563eb' },
        { label: 'Processed', value: stats.processed, icon: renderBillingIcon('processed', { size: 22 }), color: '#10b981' },
        { label: 'Failed', value: stats.failed, icon: renderBillingIcon('failedStat', { size: 22 }), color: '#ef4444' },
        { label: 'Success Rate', value: `${stats.success_rate?.toFixed(1) || 0}%`, icon: renderBillingIcon('overview', { size: 22 }), color: '#8b5cf6' },
    ];

    return (
        <div className="webhook-stats">
            <div className="stats-grid">
                {statCards.map((card, index) => (
                    <div key={index} className="stat-card" style={{ borderTopColor: card.color }}>
                        <div className="stat-card-header">
                            <span className="stat-icon">{card.icon}</span>
                            <span className="stat-label">{card.label}</span>
                        </div>
                        <div className="stat-value">{card.value}</div>
                    </div>
                ))}
            </div>

            {stats.by_event_type && (
                <div className="event-breakdown">
                    <h4>Breakdown by Event Type</h4>
                    <div className="breakdown-grid">
                        {Object.entries(stats.by_event_type).map(([event, data]) => (
                            <div key={event} className="breakdown-item">
                                <span className="breakdown-event">{event}</span>
                                <div className="breakdown-bar-container">
                                    <div 
                                        className="breakdown-bar"
                                        style={{ width: `${data.success_rate}%` }}
                                    />
                                </div>
                                <span className="breakdown-stats">
                                    {data.processed}/{data.total} ({data.success_rate.toFixed(1)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

WebhookStats.propTypes = {
    stats: PropTypes.shape({
        total: PropTypes.number,
        processed: PropTypes.number,
        failed: PropTypes.number,
        duplicate: PropTypes.number,
        success_rate: PropTypes.number,
        by_event_type: PropTypes.object,
    }),
    loading: PropTypes.bool,
};

export default WebhookStats;