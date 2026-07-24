// frontend/src/components/reports/dashboards/DashboardView.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiRefreshCw, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { WidgetRenderer } from '../widgets/WidgetRenderer';
import { useWidgets } from '../../../hooks/reports';
import './dashboards.css';

export const DashboardView = ({
    dashboard,
    preview = false,
    className = '',
}) => {
    const [widgets, setWidgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    const { fetchWidgetsByDashboard } = useWidgets({ autoFetch: false });

    useEffect(() => {
        if (dashboard?.id) {
            loadWidgets();
        }
    }, [dashboard?.id]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (dashboard?.layout?.auto_refresh && !preview) {
                refreshWidgets();
            }
        }, (dashboard?.refresh_interval || 300) * 1000);

        return () => clearInterval(interval);
    }, [dashboard, preview]);

    const loadWidgets = async () => {
        setLoading(true);
        try {
            const result = await fetchWidgetsByDashboard(dashboard.id);
            setWidgets(result || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to load widgets');
        } finally {
            setLoading(false);
        }
    };

    const refreshWidgets = async () => {
        await loadWidgets();
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        if (!isFullscreen) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    const getGridColumns = () => {
        return dashboard?.layout?.grid_columns || 12;
    };

    const getWidgetSize = (widget) => {
        const size = widget.size || { w: 4, h: 3 };
        const columns = getGridColumns();
        const width = (size.w / columns) * 100;
        return {
            width: `${width}%`,
            height: `${size.h * 100}px`,
        };
    };

    if (loading && widgets.length === 0) {
        return (
            <div className="dashboard-view-loading">
                <div className="loading-spinner-small" />
                <span>Loading dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-view-error">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
                <button className="btn btn-secondary btn-sm" onClick={loadWidgets}>
                    Retry
                </button>
            </div>
        );
    }

    if (widgets.length === 0) {
        return (
            <div className="dashboard-view-empty">
                <span className="empty-icon">📊</span>
                <p>No widgets on this dashboard</p>
                {!preview && (
                    <button className="btn btn-primary btn-sm">
                        Add Widgets
                    </button>
                )}
            </div>
        );
    }

    const activeWidgets = widgets.filter(w => w.is_active !== false);

    return (
        <div
            className={`dashboard-view ${isFullscreen ? 'fullscreen' : ''} ${className}`}
            ref={containerRef}
            style={{
                gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
            }}
        >
            {!preview && (
                <div className="dashboard-toolbar">
                    <button className="toolbar-btn" onClick={refreshWidgets} title="Refresh">
                        <FiRefreshCw size={16} />
                    </button>
                    <button className="toolbar-btn" onClick={toggleFullscreen} title="Fullscreen">
                        {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
                    </button>
                </div>
            )}

            <div className="dashboard-widgets">
                {activeWidgets.map((widget) => (
                    <div
                        key={widget.id}
                        className="dashboard-widget"
                        style={getWidgetSize(widget)}
                    >
                        <WidgetRenderer
                            widget={widget}
                            preview={preview}
                            onRefresh={() => {
                                // Refresh individual widget
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

DashboardView.propTypes = {
    dashboard: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        layout: PropTypes.object,
        refresh_interval: PropTypes.number,
    }).isRequired,
    preview: PropTypes.bool,
    className: PropTypes.string,
};