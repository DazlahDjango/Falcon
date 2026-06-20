// src/components/reviews/reviewAnalytics/ReviewInsightsPanel.jsx
import React from 'react';
import './analytics.css';

const ReviewInsightsPanel = ({ insights: rawInsights, onInsightClick, onGenerate, loading, generating }) => {
    // Ensure insights is always an array
    const insights = Array.isArray(rawInsights) ? rawInsights : [];
    
    const getInsightIcon = (type) => {
        switch (type) {
            case 'positive':
                return { icon: '🎉', class: 'insight-icon-positive' };
            case 'negative':
                return { icon: '⚠️', class: 'insight-icon-negative' };
            case 'warning':
                return { icon: '🔴', class: 'insight-icon-warning' };
            case 'opportunity':
                return { icon: '💡', class: 'insight-icon-info' };
            case 'trend':
                return { icon: '📈', class: 'insight-icon-info' };
            default:
                return { icon: 'ℹ️', class: 'insight-icon-info' };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="chart-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="chart-title" style={{ marginBottom: 0 }}>AI Insights</div>
                <button
                    onClick={onGenerate}
                    disabled={generating}
                    className="filter-button"
                    style={{ fontSize: '12px', padding: '4px 12px' }}
                >
                    {generating ? 'Generating...' : 'Generate New'}
                </button>
            </div>
            
            {loading ? (
                <div className="analytics-loading">Loading insights...</div>
            ) : insights.length === 0 ? (
                <div className="analytics-empty">No insights available. Click "Generate New" to create insights.</div>
            ) : (
                <div className="insights-panel">
                    {insights.map(insight => {
                        const { icon, class: iconClass } = getInsightIcon(insight.type);
                        return (
                            <div
                                key={insight.id}
                                className="insight-item"
                                onClick={() => onInsightClick?.(insight)}
                            >
                                <div className={`insight-icon ${iconClass}`}>
                                    {icon}
                                </div>
                                <div className="insight-content">
                                    <div className="insight-title">{insight.title}</div>
                                    <div className="insight-description">{insight.description}</div>
                                    <div className="insight-meta">
                                        {insight.category && <span>Category: {insight.category} | </span>}
                                        {formatDate(insight.created_at)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ReviewInsightsPanel;