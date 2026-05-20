import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiMoreVertical, FiRefreshCw, FiDownload, FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

export const DashboardWidget = ({ 
  id,
  title,
  children,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  onRemove,
  onResize,
  isEditable = false,
  defaultExpanded = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [size, setSize] = useState({ width: '100%', height: 'auto' });
  const widgetRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResizeStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = widgetRef.current?.offsetWidth || 0;
    const startHeight = widgetRef.current?.offsetHeight || 0;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const newWidth = Math.max(300, startWidth + deltaX);
      const newHeight = Math.max(200, startHeight + deltaY);
      setSize({ width: `${newWidth}px`, height: `${newHeight}px` });
      onResize?.(id, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [id, onResize];

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="widget-loading">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="widget-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          {onRefresh && (
            <button onClick={onRefresh} className="retry-btn">
              Retry
            </button>
          )}
        </div>
      );
    }

    return children;
  };

  return (
    <div 
      ref={widgetRef}
      className={`dashboard-widget ${isExpanded ? 'expanded' : ''} ${isDragging ? 'resizing' : ''} ${className}`}
      style={{ 
        width: size.width,
        height: isExpanded ? 'auto' : size.height,
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }}
    >
      {/* Widget Header */}
      <div className="widget-header">
        <div className="widget-title">
          <h3>{title}</h3>
        </div>
        
        <div className="widget-actions">
          {onRefresh && (
            <button 
              className="widget-action-btn"
              onClick={onRefresh}
              title="Refresh"
            >
              <FiRefreshCw size={14} />
            </button>
          )}
          
          {onExport && (
            <button 
              className="widget-action-btn"
              onClick={onExport}
              title="Export"
            >
              <FiDownload size={14} />
            </button>
          )}
          
          <button 
            className="widget-action-btn"
            onClick={toggleExpand}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <FiMinimize2 size={14} /> : <FiMaximize2 size={14} />}
          </button>
          
          {isEditable && (
            <>
              <div className="widget-menu-container" ref={menuRef}>
                <button 
                  className="widget-action-btn"
                  onClick={() => setShowMenu(!showMenu)}
                  title="More options"
                >
                  <FiMoreVertical size={14} />
                </button>
                
                {showMenu && (
                  <div className="widget-menu-dropdown">
                    <button onClick={() => onRemove?.(id)}>
                      <FiX size={14} />
                      Remove Widget
                    </button>
                  </div>
                )}
              </div>
              
              {onResize && (
                <div 
                  className="widget-resize-handle"
                  onMouseDown={handleResizeStart}
                  title="Resize"
                />
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Widget Body */}
      <div className={`widget-body ${isExpanded ? 'expanded' : ''}`}>
        {renderContent()}
      </div>
      
      <style jsx>{`
        .dashboard-widget {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
        }
        
        .dashboard-widget:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }
        
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        
        .widget-title h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }
        
        .widget-actions {
          display: flex;
          gap: 4px;
          position: relative;
        }
        
        .widget-action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          transition: all 0.2s;
        }
        
        .widget-action-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
        
        .widget-body {
          flex: 1;
          padding: 16px;
          overflow: auto;
          max-height: 500px;
        }
        
        .widget-body.expanded {
          max-height: none;
        }
        
        .widget-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          gap: 12px;
        }
        
        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .widget-error {
          text-align: center;
          padding: 40px;
          color: #ef4444;
        }
        
        .error-icon {
          font-size: 32px;
          display: block;
          margin-bottom: 12px;
        }
        
        .retry-btn {
          margin-top: 12px;
          padding: 6px 12px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        
        .widget-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 100;
          min-width: 150px;
        }
        
        .widget-menu-dropdown button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          font-size: 13px;
          color: #1e293b;
        }
        
        .widget-menu-dropdown button:hover {
          background: #f1f5f9;
        }
        
        .widget-resize-handle {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 16px;
          height: 16px;
          cursor: nw-resize;
          background: linear-gradient(135deg, transparent 50%, #cbd5e1 50%);
          border-radius: 0 0 4px 0;
        }
        
        .dashboard-widget.resizing {
          opacity: 0.8;
          cursor: nw-resize;
        }
      `}</style>
    </div>
  );
};

DashboardWidget.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRefresh: PropTypes.func,
  onExport: PropTypes.func,
  onRemove: PropTypes.func,
  onResize: PropTypes.func,
  isEditable: PropTypes.bool,
  defaultExpanded: PropTypes.bool,
  className: PropTypes.string
};