import React from 'react';
import PropTypes from 'prop-types';
import { WidgetFactory } from '../widgets/WidgetFactory';

export const DashboardGrid = ({ 
  widgets, 
  layout, 
  onEditWidget,
  children,
  className = '' 
}) => {
  const columns = layout?.columns || 12;
  const gap = layout?.margin || 10;
  const cellHeight = layout?.cellHeight || 100;

  const getWidgetPosition = (widget) => {
    return {
      row: widget.row || 0,
      col: widget.col || 0,
      width: widget.width || 4,
      height: widget.height || 3
    };
  };

  const getWidgetStyle = (widget) => {
    const { row, col, width, height } = getWidgetPosition(widget);
    return {
      gridColumn: `${col + 1} / span ${width}`,
      gridRow: `${row + 1} / span ${height}`,
      position: 'relative'
    };
  };

  // Calculate total rows needed
  const maxRow = Math.max(
    ...widgets.map(w => (w.row || 0) + (w.height || 3)),
    12
  );

  return (
    <div 
      className={`dashboard-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridAutoRows: `${cellHeight}px`,
        gap: `${gap}px`,
        minHeight: `${maxRow * cellHeight + (maxRow - 1) * gap}px`,
        position: 'relative'
      }}
    >
      {widgets.map((widget) => {
        const widgetProps = {
          type: widget.widget_type,
          props: {
            ...widget.config,
            data: widget.data,
            loading: widget.loading,
            error: widget.error,
            title: widget.title,
            onRefresh: widget.onRefresh,
            onExport: widget.onExport,
            onKpiClick: widget.onKpiClick,
            onDepartmentClick: widget.onDepartmentClick,
            onUserClick: widget.onUserClick,
            onAlertClick: widget.onAlertClick
          }
        };

        return (
          <div 
            key={widget.id}
            className="dashboard-grid-widget"
            style={getWidgetStyle(widget)}
            onDoubleClick={() => onEditWidget?.(widget)}
          >
            <WidgetFactory {...widgetProps} />
            {onEditWidget && (
              <button
                className="widget-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditWidget(widget);
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'none',
                  zIndex: 10
                }}
              >
                ✏️
              </button>
            )}
          </div>
        );
      })}
      
      {children}
    </div>
  );
};

DashboardGrid.propTypes = {
  widgets: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    widget_type: PropTypes.string.isRequired,
    title: PropTypes.string,
    row: PropTypes.number,
    col: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    config: PropTypes.object,
    data: PropTypes.any,
    loading: PropTypes.bool,
    error: PropTypes.string
  })),
  layout: PropTypes.shape({
    columns: PropTypes.number,
    cellHeight: PropTypes.number,
    margin: PropTypes.number
  }),
  onEditWidget: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string
};