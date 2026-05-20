import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiSave, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { DashboardCard } from '../common/DashboardCard';

export const WidgetConfigPanel = ({ 
  widget, 
  onSave, 
  onDelete, 
  onClose,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    title: widget?.title || '',
    widget_type: widget?.widget_type || 'kpi_list',
    width: widget?.width || 4,
    height: widget?.height || 3,
    config: widget?.config || {},
    is_visible: widget?.is_visible !== false,
    refresh_interval: widget?.refresh_interval || 60
  });

  const widgetTypes = [
    { value: 'kpi_list', label: 'KPI List', description: 'Display list of KPIs with scores and status' },
    { value: 'trend_chart', label: 'Trend Chart', description: 'Show performance trends over time' },
    { value: 'department_heatmap', label: 'Department Heatmap', description: 'Visualize department performance' },
    { value: 'compliance', label: 'Compliance', description: 'Show data submission and review rates' },
    { value: 'red_alert', label: 'Red Alerts', description: 'Display critical KPIs below target' },
    { value: 'pending_approvals', label: 'Pending Approvals', description: 'List submissions awaiting approval' },
    { value: 'missing_data', label: 'Missing Data', description: 'Show missing data entries' },
    { value: 'team_performance', label: 'Team Performance', description: 'Display team member performance' }
  ];

  const refreshIntervals = [
    { value: 0, label: 'Never' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 120, label: '2 minutes' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const renderTypeSpecificConfig = () => {
    switch (formData.widget_type) {
      case 'kpi_list':
        return (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              KPI Selection
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <select
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              >
                <option value="">Select KPI to add...</option>
              </select>
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Configure which KPIs to display in this widget
            </div>
          </div>
        );
      
      case 'trend_chart':
        return (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              KPI for Trend
            </label>
            <select
              value={formData.config.kpi_id || ''}
              onChange={(e) => handleConfigChange('kpi_id', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              <option value="">Select KPI...</option>
            </select>
          </div>
        );
      
      case 'team_performance':
        return (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              Team Selection
            </label>
            <select
              value={formData.config.team_id || ''}
              onChange={(e) => handleConfigChange('team_id', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              <option value="">Select Team...</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
              <input
                type="checkbox"
                checked={formData.config.show_aggregate || false}
                onChange={(e) => handleConfigChange('show_aggregate', e.target.checked)}
              />
              <span style={{ fontSize: '13px' }}>Show aggregate metrics</span>
            </label>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            {widget ? 'Edit Widget' : 'Add Widget'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>
        
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              Widget Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., KPI Overview"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              Widget Type
            </label>
            <select
              value={formData.widget_type}
              onChange={(e) => handleChange('widget_type', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              {widgetTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              {widgetTypes.find(t => t.value === formData.widget_type)?.description}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                Width (1-12)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.width}
                onChange={(e) => handleChange('width', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                Height (1-12)
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.height}
                onChange={(e) => handleChange('height', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
              Auto Refresh
            </label>
            <select
              value={formData.refresh_interval}
              onChange={(e) => handleChange('refresh_interval', parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            >
              {refreshIntervals.map(interval => (
                <option key={interval.value} value={interval.value}>{interval.label}</option>
              ))}
            </select>
          </div>
          
          {renderTypeSpecificConfig()}
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => handleChange('is_visible', e.target.checked)}
              />
              <span style={{ fontSize: '13px' }}>
                {formData.is_visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
                {' '}Visible on dashboard
              </span>
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.6 : 1
              }}
            >
              <FiSave size={14} />
              {loading ? 'Saving...' : 'Save Widget'}
            </button>
            {onDelete && widget && (
              <button
                onClick={() => onDelete(widget.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid #fee2e2',
                  background: 'white',
                  color: '#dc2626',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiTrash2 size={14} />
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

WidgetConfigPanel.propTypes = {
  widget: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool
};