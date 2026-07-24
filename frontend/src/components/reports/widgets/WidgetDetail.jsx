// frontend/src/components/reports/widgets/WidgetDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiRefreshCw, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import { useWidget } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { WidgetRenderer } from './WidgetRenderer';
import { WidgetStatusBadge } from './WidgetStatusBadge';
import './widgets.css';

export const WidgetDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const {
        widget,
        widgetData,
        loading,
        error,
        fetchOne,
        fetchData,
        remove,
        refreshWidget,
        clearErrors,
    } = useWidget(id, { autoFetch: true });

    useEffect(() => {
        if (widget) {
            fetchData(id);
        }
    }, [id, widget]);

    const handleBack = () => {
        navigate('/reports/widgets');
    };

    const handleEdit = () => {
        navigate(`/reports/widgets/${id}/edit`);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        await remove(id);
        navigate('/reports/widgets');
    };

    const handleRefresh = async () => {
        await refreshWidget(id);
        await fetchData(id);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading widget..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load widget"
            />
        );
    }

    if (!widget) {
        return <ReportError error="Widget not found" title="Widget not found" />;
    }

    return (
        <div className={`widget-detail-container ${isFullscreen ? 'fullscreen' : ''}`}>
            <div className="widget-detail-header">
                <div className="header-left">
                    <button className="btn btn-outline back-btn" onClick={handleBack}>
                        <FiArrowLeft size={18} />
                        Back to Widgets
                    </button>
                    <h1 className="widget-title">{widget.title || widget.name}</h1>
                </div>
                <div className="header-right">
                    <WidgetStatusBadge
                        isActive={widget.is_active}
                        isVisible={widget.is_visible}
                    />
                    <button className="btn btn-secondary" onClick={handleRefresh}>
                        <FiRefreshCw size={16} />
                        Refresh
                    </button>
                    <button className="btn btn-secondary" onClick={toggleFullscreen}>
                        {isFullscreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
                    </button>
                    <button className="btn btn-secondary" onClick={handleEdit}>
                        <FiEdit2 size={16} />
                        Edit
                    </button>
                    <button className="btn btn-danger" onClick={handleDelete}>
                        <FiTrash2 size={16} />
                        Delete
                    </button>
                </div>
            </div>

            <div className="widget-detail-body">
                <div className="widget-info-panel">
                    <div className="info-section">
                        <h4>Widget Details</h4>
                        <div className="info-row">
                            <span className="info-label">Type:</span>
                            <span className="info-value">{widget.widget_type}</span>
                        </div>
                        {widget.subtitle && (
                            <div className="info-row">
                                <span className="info-label">Subtitle:</span>
                                <span className="info-value">{widget.subtitle}</span>
                            </div>
                        )}
                        {widget.dashboard_name && (
                            <div className="info-row">
                                <span className="info-label">Dashboard:</span>
                                <span className="info-value">{widget.dashboard_name}</span>
                            </div>
                        )}
                        <div className="info-row">
                            <span className="info-label">Size:</span>
                            <span className="info-value">{widget.size?.w || 0}x{widget.size?.h || 0}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Auto-refresh:</span>
                            <span className="info-value">{widget.auto_refresh ? `${widget.refresh_interval}s` : 'Disabled'}</span>
                        </div>
                        {widget.data_source && (
                            <div className="info-row">
                                <span className="info-label">Data Source:</span>
                                <span className="info-value">{widget.data_source}</span>
                            </div>
                        )}
                    </div>

                    {widget.filters && Object.keys(widget.filters).length > 0 && (
                        <div className="info-section">
                            <h4>Filters</h4>
                            {Object.entries(widget.filters).map(([key, value]) => (
                                <div key={key} className="info-row">
                                    <span className="info-label">{key}:</span>
                                    <span className="info-value">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="widget-renderer-container">
                    <WidgetRenderer
                        widget={widget}
                        data={widgetData}
                        loading={loading}
                        error={error}
                        onRefresh={handleRefresh}
                    />
                </div>

                {widget.config && Object.keys(widget.config).length > 0 && (
                    <div className="widget-config-panel">
                        <h4>Configuration</h4>
                        <pre className="config-json">
                            {JSON.stringify(widget.config, null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            <ReportConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Widget"
                message={`Are you sure you want to delete the widget "${widget.title || widget.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};