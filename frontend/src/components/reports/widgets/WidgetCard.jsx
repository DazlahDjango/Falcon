// frontend/src/components/reports/widgets/WidgetCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { FiEye, FiEdit2, FiTrash2, FiRefreshCw, FiMove } from 'react-icons/fi';
import { WidgetStatusBadge } from './WidgetStatusBadge';
import './widgets.css';

export const WidgetCard = ({
    widget,
    onView,
    onEdit,
    onDelete,
    onRefresh,
    onDragStart,
    className = '',
}) => {
    const getWidgetTypeIcon = (type) => {
        const icons = {
            kpi: '📊',
            chart: '📈',
            table: '📋',
            heatmap: '🔥',
            trend: '📉',
            gauge: '🎯',
            pie: '🥧',
            bar: '📊',
            line: '📈',
            area: '📊',
            scatter: '🔵',
            map: '🗺',
            list: '📝',
            summary: '📄',
            mission: '🎯',
            pip: '📋',
            compliance: '✅',
            custom: '⚙️',
        };
        return icons[type] || '📄';
    };

    const getWidgetTypeLabel = (type) => {
        const labels = {
            kpi: 'KPI Card',
            chart: 'Chart',
            table: 'Table',
            heatmap: 'Heatmap',
            trend: 'Trend Chart',
            gauge: 'Gauge',
            pie: 'Pie Chart',
            bar: 'Bar Chart',
            line: 'Line Chart',
            area: 'Area Chart',
            scatter: 'Scatter Plot',
            map: 'Map',
            list: 'List',
            summary: 'Summary Card',
            mission: 'Mission Status',
            pip: 'PIP Tracker',
            compliance: 'Compliance Status',
            custom: 'Custom Widget',
        };
        return labels[type] || type;
    };

    const getSizeLabel = (size) => {
        if (!size) return 'Default';
        return `${size.w || 0}x${size.h || 0}`;
    };

    return (
        <div
            className={`widget-card ${className} ${!widget.is_active ? 'inactive' : ''}`}
            draggable={!!onDragStart}
            onDragStart={onDragStart ? (e) => onDragStart(e, widget) : undefined}
        >
            <div className="widget-card-header">
                <div className="widget-card-type">
                    <span className="type-icon">{getWidgetTypeIcon(widget.widget_type)}</span>
                    <span className="type-label">{getWidgetTypeLabel(widget.widget_type)}</span>
                </div>
                <WidgetStatusBadge
                    isActive={widget.is_active}
                    isVisible={widget.is_visible}
                    size="small"
                />
            </div>
            <div className="widget-card-body">
                <h3 className="widget-card-title">{widget.title || widget.name}</h3>
                {widget.subtitle && (
                    <p className="widget-card-subtitle">{widget.subtitle}</p>
                )}
                <div className="widget-card-meta">
                    {widget.dashboard_name && (
                        <span className="meta-item">
                            <span className="meta-label">Dashboard:</span>
                            <span className="meta-value">{widget.dashboard_name}</span>
                        </span>
                    )}
                    <span className="meta-item">
                        <span className="meta-label">Size:</span>
                        <span className="meta-value">{getSizeLabel(widget.size)}</span>
                    </span>
                    {widget.auto_refresh && (
                        <span className="meta-item">
                            <span className="meta-label">Auto-refresh:</span>
                            <span className="meta-value">{widget.refresh_interval}s</span>
                        </span>
                    )}
                </div>
            </div>
            <div className="widget-card-actions">
                <button
                    className="action-btn view"
                    onClick={() => onView?.(widget.id)}
                    title="View Widget"
                >
                    <FiEye size={16} />
                </button>
                <button
                    className="action-btn edit"
                    onClick={() => onEdit?.(widget.id)}
                    title="Edit Widget"
                >
                    <FiEdit2 size={16} />
                </button>
                <button
                    className="action-btn refresh"
                    onClick={() => onRefresh?.(widget.id)}
                    title="Refresh Widget"
                >
                    <FiRefreshCw size={16} />
                </button>
                {onDragStart && (
                    <button
                        className="action-btn drag"
                        title="Drag to reorder"
                    >
                        <FiMove size={16} />
                    </button>
                )}
                <button
                    className="action-btn delete"
                    onClick={() => onDelete?.(widget)}
                    title="Delete Widget"
                >
                    <FiTrash2 size={16} />
                </button>
            </div>
        </div>
    );
};

WidgetCard.propTypes = {
    widget: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        title: PropTypes.string,
        subtitle: PropTypes.string,
        widget_type: PropTypes.string,
        is_active: PropTypes.bool,
        is_visible: PropTypes.bool,
        dashboard_name: PropTypes.string,
        size: PropTypes.object,
        auto_refresh: PropTypes.bool,
        refresh_interval: PropTypes.number,
    }).isRequired,
    onView: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    onRefresh: PropTypes.func,
    onDragStart: PropTypes.func,
    className: PropTypes.string,
};