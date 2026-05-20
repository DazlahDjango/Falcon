import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FiGrid, FiSave, FiRefreshCw, FiPlus, FiX } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';

export const LayoutEditor = ({ 
  widgets, 
  layout, 
  onSave, 
  onAddWidget,
  onRemoveWidget,
  onUpdateWidget,
  loading = false,
  title = 'Dashboard Layout Editor'
}) => {
  const [editMode, setEditMode] = useState(true);
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [dragOverPosition, setDragOverPosition] = useState(null);

  const columns = layout?.columns || 12;
  const cellHeight = layout?.cellHeight || 100;
  const margin = layout?.margin || 10;

  const getWidgetPosition = (widget) => {
    return { row: widget.row || 0, col: widget.col || 0, width: widget.width || 4, height: widget.height || 3 };
  };

  const isPositionOccupied = (row, col, width, height, excludeWidgetId = null) => {
    for (const widget of widgets) {
      if (excludeWidgetId && widget.id === excludeWidgetId) continue;
      const wRow = widget.row || 0;
      const wCol = widget.col || 0;
      const wWidth = widget.width || 4;
      const wHeight = widget.height || 3;
      
      if (row < wRow + wHeight && row + height > wRow &&
          col < wCol + wWidth && col + width > wCol) {
        return true;
      }
    }
    return false;
  };

  const findEmptyPosition = (width, height, startRow = 0) => {
    let row = startRow;
    while (row < 100) {
      for (let col = 0; col <= columns - width; col++) {
        if (!isPositionOccupied(row, col, width, height)) {
          return { row, col };
        }
      }
      row++;
    }
    return { row: startRow, col: 0 };
  };

  const handleDrop = useCallback((dragWidget, targetRow, targetCol) => {
    if (!dragWidget) return;
    
    const { width, height } = getWidgetPosition(dragWidget);
    
    if (!isPositionOccupied(targetRow, targetCol, width, height, dragWidget.id)) {
      onUpdateWidget(dragWidget.id, { row: targetRow, col: targetCol });
      setDraggedWidget(null);
      setDragOverPosition(null);
    }
  }, [onUpdateWidget]);

  const handleDragStart = (widget) => {
    setDraggedWidget(widget);
  };

  const handleDragOver = (e, row, col) => {
    e.preventDefault();
    setDragOverPosition({ row, col });
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
    setDragOverPosition(null);
  };

  const renderGrid = () => {
    const cells = [];
    const maxRow = Math.max(...widgets.map(w => (w.row || 0) + (w.height || 3)), 12);
    
    for (let row = 0; row < maxRow; row++) {
      for (let col = 0; col < columns; col++) {
        const widget = widgets.find(w => {
          const wRow = w.row || 0;
          const wCol = w.col || 0;
          const wWidth = w.width || 4;
          const wHeight = w.height || 3;
          return row >= wRow && row < wRow + wHeight && col >= wCol && col < wCol + wWidth;
        });
        
        const isDragOver = dragOverPosition?.row === row && dragOverPosition?.col === col;
        
        cells.push(
          <div
            key={`${row}-${col}`}
            onDragOver={(e) => handleDragOver(e, row, col)}
            onDrop={() => draggedWidget && handleDrop(draggedWidget, row, col)}
            style={{
              border: '1px solid #e2e8f0',
              background: widget ? '#eff6ff' : isDragOver ? '#dbeafe' : '#f8fafc',
              borderRadius: '4px',
              gridColumn: `span 1`,
              minHeight: `${cellHeight}px`,
              position: 'relative',
              transition: 'background 0.2s'
            }}
          >
            {widget && (
              <div
                draggable={editMode}
                onDragStart={() => handleDragStart(widget)}
                onDragEnd={handleDragEnd}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '8px',
                  background: 'white',
                  borderRadius: '6px',
                  border: '1px solid #3b82f6',
                  cursor: editMode ? 'grab' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#3b82f6' }}>
                    {widget.title || widget.widget_type}
                  </span>
                  {editMode && (
                    <button
                      onClick={() => onRemoveWidget?.(widget.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: '#ef4444'
                      }}
                    >
                      <FiX size={12} />
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  {widget.width}x{widget.height}
                </div>
              </div>
            )}
          </div>
        );
      }
    }
    
    return cells;
  };

  const handleAddWidget = () => {
    const defaultWidth = 4;
    const defaultHeight = 3;
    const { row, col } = findEmptyPosition(defaultWidth, defaultHeight);
    onAddWidget({ row, col, width: defaultWidth, height: defaultHeight });
  };

  const handleSaveLayout = () => {
    const updatedLayout = {
      ...layout,
      widgets: widgets.map(w => ({
        id: w.id,
        row: w.row,
        col: w.col,
        width: w.width,
        height: w.height
      }))
    };
    onSave(updatedLayout);
    setEditMode(false);
  };

  return (
    <DashboardCard 
      title={title}
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          {editMode ? (
            <>
              <button
                onClick={handleAddWidget}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <FiPlus size={12} />
                Add Widget
              </button>
              <button
                onClick={handleSaveLayout}
                disabled={loading}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <FiSave size={12} />
                Save Layout
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px'
              }}
            >
              <FiGrid size={12} />
              Edit Layout
            </button>
          )}
        </div>
      }
    >
      {editMode ? (
        <>
          <div style={{ marginBottom: '12px', padding: '8px', background: '#fef3c7', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
            💡 Drag and drop widgets to rearrange. Click Save Layout when done.
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${margin}px`,
            background: '#f1f5f9',
            padding: `${margin}px`,
            borderRadius: '8px',
            minHeight: '400px'
          }}>
            {renderGrid()}
          </div>
        </>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${margin}px`,
          minHeight: '200px'
        }}>
          {widgets.map(widget => {
            const width = widget.width || 4;
            const height = widget.height || 3;
            return (
              <div
                key={widget.id}
                style={{
                  gridColumn: `span ${width}`,
                  gridRow: `span ${height}`,
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: '8px' }}>
                  {widget.title || widget.widget_type}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {widget.width}x{widget.height} widget
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {widgets.length === 0 && editMode && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <FiGrid size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <p>No widgets yet. Click "Add Widget" to get started.</p>
        </div>
      )}
    </DashboardCard>
  );
};

LayoutEditor.propTypes = {
  widgets: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    widget_type: PropTypes.string,
    row: PropTypes.number,
    col: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
  })),
  layout: PropTypes.shape({
    columns: PropTypes.number,
    cellHeight: PropTypes.number,
    margin: PropTypes.number
  }),
  onSave: PropTypes.func.isRequired,
  onAddWidget: PropTypes.func,
  onRemoveWidget: PropTypes.func,
  onUpdateWidget: PropTypes.func,
  loading: PropTypes.bool,
  title: PropTypes.string
};