// frontend/src/components/reports/dashboards/DashboardLayout.jsx
import React, { useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiMove, FiPlus, FiX } from 'react-icons/fi';
import { DashboardView } from './DashboardView';
import './dashboards.css';

export const DashboardLayout = ({
    dashboard,
    widgets = [],
    onWidgetMove,
    onWidgetResize,
    onWidgetRemove,
    onWidgetAdd,
    editable = false,
    className = '',
}) => {
    const [draggingWidget, setDraggingWidget] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const containerRef = useRef(null);

    const handleDragStart = useCallback((e, widget) => {
        if (!editable) return;
        setDraggingWidget(widget);
        e.dataTransfer.effectAllowed = 'move';
    }, [editable]);

    const handleDragOver = useCallback((e, widget) => {
        e.preventDefault();
        if (!editable || !draggingWidget) return;
        setDropTarget(widget);
    }, [editable, draggingWidget]);

    const handleDragLeave = useCallback(() => {
        setDropTarget(null);
    }, []);

    const handleDrop = useCallback((e, targetWidget) => {
        e.preventDefault();
        if (!editable || !draggingWidget || draggingWidget.id === targetWidget.id) {
            setDraggingWidget(null);
            setDropTarget(null);
            return;
        }

        onWidgetMove?.(draggingWidget, targetWidget);
        setDraggingWidget(null);
        setDropTarget(null);
    }, [editable, draggingWidget, onWidgetMove]);

    const handleDragEnd = useCallback(() => {
        setDraggingWidget(null);
        setDropTarget(null);
    }, []);

    const handleRemove = useCallback((widget) => {
        if (!editable) return;
        onWidgetRemove?.(widget);
    }, [editable, onWidgetRemove]);

    const handleAdd = useCallback(() => {
        if (!editable) return;
        onWidgetAdd?.();
    }, [editable, onWidgetAdd]);

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

    return (
        <div
            className={`dashboard-layout ${className}`}
            ref={containerRef}
            style={{
                gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
            }}
        >
            {widgets.map((widget) => (
                <div
                    key={widget.id}
                    className={`dashboard-widget ${dropTarget?.id === widget.id ? 'drop-target' : ''} ${draggingWidget?.id === widget.id ? 'dragging' : ''}`}
                    style={getWidgetSize(widget)}
                    draggable={editable}
                    onDragStart={(e) => handleDragStart(e, widget)}
                    onDragOver={(e) => handleDragOver(e, widget)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, widget)}
                    onDragEnd={handleDragEnd}
                >
                    {editable && (
                        <div className="widget-controls">
                            <button
                                className="control-btn drag-handle"
                                title="Drag to reorder"
                            >
                                <FiMove size={14} />
                            </button>
                            <button
                                className="control-btn remove"
                                onClick={() => handleRemove(widget)}
                                title="Remove widget"
                            >
                                <FiX size={14} />
                            </button>
                        </div>
                    )}
                    <DashboardView dashboard={dashboard} preview />
                </div>
            ))}

            {editable && (
                <div className="add-widget-placeholder" onClick={handleAdd}>
                    <FiPlus size={24} />
                    <span>Add Widget</span>
                </div>
            )}
        </div>
    );
};

DashboardLayout.propTypes = {
    dashboard: PropTypes.shape({
        id: PropTypes.string.isRequired,
        layout: PropTypes.object,
    }).isRequired,
    widgets: PropTypes.array,
    onWidgetMove: PropTypes.func,
    onWidgetResize: PropTypes.func,
    onWidgetRemove: PropTypes.func,
    onWidgetAdd: PropTypes.func,
    editable: PropTypes.bool,
    className: PropTypes.string,
};