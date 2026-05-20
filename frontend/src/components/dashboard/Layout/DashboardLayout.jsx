import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiSettings, FiGrid, FiSave, FiX } from 'react-icons/fi';
import { DashboardGrid } from './DashboardGrid';
import { DashboardConfigModal } from '../config/DashboardConfigModal';
import { WidgetConfigPanel } from '../config/WidgetConfigPanel';
import { LayoutEditor } from '../config/LayoutEditor';

export const DashboardLayout = ({ 
  dashboardType,
  widgets: initialWidgets,
  layout: initialLayout,
  onSaveLayout,
  onAddWidget,
  onUpdateWidget,
  onRemoveWidget,
  onRefresh,
  loading = false,
  children
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showWidgetPanel, setShowWidgetPanel] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [widgets, setWidgets] = useState(initialWidgets || []);
  const [layout, setLayout] = useState(initialLayout || { columns: 12, cellHeight: 100, margin: 10 });

  useEffect(() => {
    if (initialWidgets) setWidgets(initialWidgets);
  }, [initialWidgets]);

  useEffect(() => {
    if (initialLayout) setLayout(initialLayout);
  }, [initialLayout]);

  const handleSaveLayout = async (newLayout) => {
    await onSaveLayout(newLayout);
    setIsEditMode(false);
  };

  const handleAddWidget = async (widgetData) => {
    await onAddWidget(widgetData);
    setShowWidgetPanel(false);
  };

  const handleEditWidget = (widget) => {
    setSelectedWidget(widget);
    setShowWidgetPanel(true);
  };

  const handleUpdateWidget = async (widgetData) => {
    await onUpdateWidget(selectedWidget.id, widgetData);
    setShowWidgetPanel(false);
    setSelectedWidget(null);
  };

  const handleRemoveWidget = async (widgetId) => {
    await onRemoveWidget(widgetId);
    setShowWidgetPanel(false);
    setSelectedWidget(null);
  };

  return (
    <div className="dashboard-layout">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1 className="dashboard-title">
            {dashboardType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Dashboard
          </h1>
          {onRefresh && (
            <button 
              className="dashboard-refresh-btn"
              onClick={onRefresh}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          )}
        </div>
        
        <div className="dashboard-header-right">
          {!isEditMode ? (
            <button 
              className="dashboard-edit-btn"
              onClick={() => setIsEditMode(true)}
            >
              <FiGrid size={16} />
              Customize Layout
            </button>
          ) : (
            <>
              <button 
                className="dashboard-add-widget-btn"
                onClick={() => setShowWidgetPanel(true)}
              >
                + Add Widget
              </button>
              <button 
                className="dashboard-save-layout-btn"
                onClick={() => setShowConfigModal(true)}
              >
                <FiSave size={16} />
                Save Layout
              </button>
              <button 
                className="dashboard-cancel-edit-btn"
                onClick={() => setIsEditMode(false)}
              >
                <FiX size={16} />
                Cancel
              </button>
            </>
          )}
          <button 
            className="dashboard-settings-btn"
            onClick={() => setShowConfigModal(true)}
          >
            <FiSettings size={16} />
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      {isEditMode ? (
        <LayoutEditor
          widgets={widgets}
          layout={layout}
          onSave={handleSaveLayout}
          onAddWidget={() => setShowWidgetPanel(true)}
          onRemoveWidget={handleRemoveWidget}
          onUpdateWidget={onUpdateWidget}
          loading={loading}
        />
      ) : (
        <DashboardGrid 
          widgets={widgets} 
          layout={layout}
          onEditWidget={handleEditWidget}
        >
          {children}
        </DashboardGrid>
      )}

      {/* Modals */}
      <DashboardConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={handleSaveLayout}
        initialConfig={{ layout, name: `${dashboardType} Dashboard` }}
        loading={loading}
      />

      <WidgetConfigPanel
        isOpen={showWidgetPanel}
        onClose={() => {
          setShowWidgetPanel(false);
          setSelectedWidget(null);
        }}
        onSave={selectedWidget ? handleUpdateWidget : handleAddWidget}
        onDelete={selectedWidget ? handleRemoveWidget : null}
        widget={selectedWidget}
        loading={loading}
      />
    </div>
  );
};

DashboardLayout.propTypes = {
  dashboardType: PropTypes.string.isRequired,
  widgets: PropTypes.array,
  layout: PropTypes.object,
  onSaveLayout: PropTypes.func.isRequired,
  onAddWidget: PropTypes.func.isRequired,
  onUpdateWidget: PropTypes.func.isRequired,
  onRemoveWidget: PropTypes.func.isRequired,
  onRefresh: PropTypes.func,
  loading: PropTypes.bool,
  children: PropTypes.node
};