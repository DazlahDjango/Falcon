// frontend/src/components/reports/widgets/WidgetRenderer.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { ReportLoading, ReportError } from '../common';
import { KPIWidget } from './KPIWidget';
import { ChartWidget } from './ChartWidget';
import { TableWidget } from './TableWidget';
import { HeatmapWidget } from './HeatmapWidget';
import { TrendWidget } from './TrendWidget';
import { GaugeWidget } from './GaugeWidget';
import './widgets.css';

export const WidgetRenderer = ({
    widget,
    data,
    loading,
    error,
    onRefresh,
    className = '',
}) => {
    if (loading) {
        return (
            <div className="widget-renderer-loading">
                <ReportLoading variant="spinner" text="Loading widget..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="widget-renderer-error">
                <ReportError
                    error={error}
                    onRetry={onRefresh}
                    title="Failed to render widget"
                />
            </div>
        );
    }

    if (!widget) {
        return (
            <div className="widget-renderer-empty">
                <p>No widget data</p>
            </div>
        );
    }

    const renderWidget = () => {
        const widgetType = widget.widget_type || 'kpi';
        const widgetData = data || {};

        switch (widgetType) {
            case 'kpi':
                return <KPIWidget widget={widget} data={widgetData} />;
            case 'chart':
            case 'pie':
            case 'bar':
            case 'line':
            case 'area':
            case 'scatter':
                return <ChartWidget widget={widget} data={widgetData} />;
            case 'table':
                return <TableWidget widget={widget} data={widgetData} />;
            case 'heatmap':
                return <HeatmapWidget widget={widget} data={widgetData} />;
            case 'trend':
                return <TrendWidget widget={widget} data={widgetData} />;
            case 'gauge':
                return <GaugeWidget widget={widget} data={widgetData} />;
            case 'map':
                return (
                    <div className="widget-placeholder">
                        <span className="placeholder-icon">🗺</span>
                        <p>Map widget - Coming soon</p>
                    </div>
                );
            case 'mission':
                return (
                    <div className="widget-placeholder">
                        <span className="placeholder-icon">🎯</span>
                        <p>Mission Status widget</p>
                    </div>
                );
            case 'pip':
                return (
                    <div className="widget-placeholder">
                        <span className="placeholder-icon">📋</span>
                        <p>PIP Tracker widget</p>
                    </div>
                );
            case 'compliance':
                return (
                    <div className="widget-placeholder">
                        <span className="placeholder-icon">✅</span>
                        <p>Compliance Status widget</p>
                    </div>
                );
            case 'list':
                return (
                    <div className="widget-placeholder">
                        <span className="placeholder-icon">📝</span>
                        <p>List widget</p>
                    </div>
                );
            case 'summary':
                return (
                    <div className="widget-placeholder">
                        <span className="placeholder-icon">📄</span>
                        <p>Summary Card widget</p>
                    </div>
                );
            default:
                return (
                    <div className="widget-placeholder">
                        <span className="placeholder-icon">⚙️</span>
                        <p>Custom widget - {widgetType}</p>
                        <pre className="placeholder-data">
                            {JSON.stringify(widgetData, null, 2).slice(0, 200)}
                        </pre>
                    </div>
                );
        }
    };

    return (
        <div className={`widget-renderer ${className}`}>
            <div className="widget-renderer-header">
                <h3 className="widget-title">{widget.title || widget.name}</h3>
                {widget.subtitle && (
                    <span className="widget-subtitle">{widget.subtitle}</span>
                )}
                {widget.auto_refresh && (
                    <span className="widget-refresh-badge">
                        Auto-refresh: {widget.refresh_interval}s
                    </span>
                )}
            </div>
            <div className="widget-renderer-body">
                {renderWidget()}
            </div>
        </div>
    );
};

WidgetRenderer.propTypes = {
    widget: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        title: PropTypes.string,
        subtitle: PropTypes.string,
        widget_type: PropTypes.string,
        auto_refresh: PropTypes.bool,
        refresh_interval: PropTypes.number,
    }),
    data: PropTypes.any,
    loading: PropTypes.bool,
    error: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    onRefresh: PropTypes.func,
    className: PropTypes.string,
};