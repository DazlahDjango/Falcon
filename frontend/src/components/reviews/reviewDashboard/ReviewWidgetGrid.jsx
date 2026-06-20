// src/components/reviews/reviewDashboard/ReviewWidgetGrid.jsx
import React from 'react';
import './dashboard.css';
import ReviewWidgetCard from './ReviewWidgetCard';

const ReviewWidgetGrid = ({
    widgets,
    widgetData,
    refreshing,
    onWidgetRefresh,
    onWidgetEdit,
    onWidgetDelete,
    onWidgetExpand,
    renderWidgetContent,
    loading = false,
}) => {
    if (loading) {
        return <div className="dashboard-loading">Loading dashboard...</div>;
    }

    if (!widgets || widgets.length === 0) {
        return (
            <div className="dashboard-empty">
                <p>No widgets added yet.</p>
                <p>Click "Add Widget" to customize your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="widget-grid">
            {widgets.map(widget => (
                <ReviewWidgetCard
                    key={widget.id}
                    widget={widget}
                    onRefresh={onWidgetRefresh}
                    onEdit={onWidgetEdit}
                    onDelete={onWidgetDelete}
                    onExpand={onWidgetExpand}
                    refreshing={refreshing[widget.id]}
                >
                    {renderWidgetContent?.(widget, widgetData[widget.id])}
                </ReviewWidgetCard>
            ))}
        </div>
    );
};

export default ReviewWidgetGrid;