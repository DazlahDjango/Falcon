import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiSave, FiGrid, FiFilter, FiEye, FiEyeOff } from 'react-icons/fi';

export const DashboardConfigModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialConfig = null,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    dashboard_type: 'executive',
    default_time_period: 'monthly',
    default_view: 'overview',
    is_default: false,
    is_shared: false,
    shared_with_roles: [],
    description: ''
  });

  const [availableRoles, setAvailableRoles] = useState([
    { value: 'executive', label: 'Executive' },
    { value: 'client_admin', label: 'Client Admin' },
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'staff', label: 'Staff' }
  ]);

  useEffect(() => {
    if (initialConfig) {
      setFormData({
        name: initialConfig.name || '',
        dashboard_type: initialConfig.dashboard_type || 'executive',
        default_time_period: initialConfig.default_time_period || 'monthly',
        default_view: initialConfig.default_view || 'overview',
        is_default: initialConfig.is_default || false,
        is_shared: initialConfig.is_shared || false,
        shared_with_roles: initialConfig.shared_with_roles || [],
        description: initialConfig.description || ''
      });
    }
  }, [initialConfig]);

  const timePeriods = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const viewOptions = [
    { value: 'overview', label: 'Overview' },
    { value: 'detailed', label: 'Detailed' },
    { value: 'compact', label: 'Compact' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleToggle = (roleValue) => {
    setFormData(prev => ({
      ...prev,
      shared_with_roles: prev.shared_with_roles.includes(roleValue)
        ? prev.shared_with_roles.filter(r => r !== roleValue)
        : [...prev.shared_with_roles, roleValue]
    }));
  };

  const handleSubmit = async () => {
    await onSave(formData);
    if (!initialConfig) {
      setFormData({
        name: '',
        dashboard_type: 'executive',
        default_time_period: 'monthly',
        default_view: 'overview',
        is_default: false,
        is_shared: false,
        shared_with_roles: [],
        description: ''
      });
    }
  };

  if (!isOpen) return null;

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
        maxWidth: '550px',
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
            {initialConfig ? 'Edit Dashboard Configuration' : 'Create Dashboard Configuration'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>
        
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Configuration Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Executive Overview"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Dashboard Type
            </label>
            <select
              value={formData.dashboard_type}
              onChange={(e) => handleChange('dashboard_type', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="executive">Executive Dashboard</option>
              <option value="client_admin">Client Admin Dashboard</option>
              <option value="super_admin">Super Admin Dashboard</option>
              <option value="manager">Manager Dashboard</option>
              <option value="staff">Staff Dashboard</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                <FiGrid style={{ display: 'inline', marginRight: '6px' }} />
                Default Time Period
              </label>
              <select
                value={formData.default_time_period}
                onChange={(e) => handleChange('default_time_period', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                {timePeriods.map(period => (
                  <option key={period.value} value={period.value}>{period.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                <FiFilter style={{ display: 'inline', marginRight: '6px' }} />
                Default View
              </label>
              <select
                value={formData.default_view}
                onChange={(e) => handleChange('default_view', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                {viewOptions.map(view => (
                  <option key={view.value} value={view.value}>{view.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
              placeholder="Describe the purpose of this dashboard configuration..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => handleChange('is_default', e.target.checked)}
              />
              <span>Set as default dashboard</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_shared}
                onChange={(e) => handleChange('is_shared', e.target.checked)}
              />
              <span>Share with other users</span>
            </label>
          </div>
          
          {formData.is_shared && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
                Share with roles
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {availableRoles.map(role => (
                  <label key={role.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.shared_with_roles.includes(role.value)}
                      onChange={() => handleRoleToggle(role.value)}
                    />
                    <span style={{ fontSize: '13px' }}>{role.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.name.trim()}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                cursor: (loading || !formData.name.trim()) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: (loading || !formData.name.trim()) ? 0.6 : 1
              }}
            >
              <FiSave size={16} />
              {loading ? 'Saving...' : initialConfig ? 'Update Configuration' : 'Create Configuration'}
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
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

DashboardConfigModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialConfig: PropTypes.object,
  loading: PropTypes.bool
};