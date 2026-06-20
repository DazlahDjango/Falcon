// src/components/reviews/reviewDashboard/ReviewWidgetCard.jsx
import React, { useState } from 'react';
import './dashboard.css';

const ReviewWidgetCard = ({
    widget,
    children,
    onRefresh,
    onEdit,
    onDelete,
    onExpand,
    refreshing = false,
}) => {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await onRefresh?.(widget.id);
        setIsRefreshing(false);
    };

    const getSizeClass = () => {
        switch (widget.size) {
            case 'small': return 'widget-small';
            case 'large': return 'widget-large';
            case 'full': return 'widget-full';
            default: return 'widget-medium';
        }
    };

    return (
        <div className={`widget-card ${getSizeClass()} ${refreshing || isRefreshing ? 'widget-refreshing' : ''}`}>
            <div className="widget-header">
                <h3 className="widget-title">{widget.title}</h3>
                <div className="widget-actions">
                    {onRefresh && (
                        <button
                            className="widget-action-btn"
                            onClick={handleRefresh}
                            title="Refresh"
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? <span className="refresh-spinner" /> : '🔄'}
                        </button>
                    )}
                    {onEdit && (
                        <button
                            className="widget-action-btn"
                            onClick={() => onEdit(widget)}
                            title="Edit"
                        >
                            ⚙️
                        </button>
                    )}
                    {onExpand && (
                        <button
                            className="widget-action-btn"
                            onClick={() => onExpand(widget)}
                            title="Expand"
                        >
                            🖥️
                        </button>
                    )}
                    {onDelete && (
                        <button
                            className="widget-action-btn"
                            onClick={() => onDelete(widget.id)}
                            title="Delete"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>
            <div className="widget-content">
                {children}
            </div>
            {widget.last_refreshed && (
                <div className="widget-footer">
                    <span>Last updated: {new Date(widget.last_refreshed).toLocaleString()}</span>
                    {widget.refresh_interval && (
                        <span>Auto-refresh: {widget.refresh_interval / 1000}s</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewWidgetCard;