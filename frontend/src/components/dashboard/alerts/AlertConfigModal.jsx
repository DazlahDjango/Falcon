import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiSave, FiAlertCircle } from 'react-icons/fi';

export const AlertConfigModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialAlert = null,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    alert_type: 'red_kpi',
    severity: 'warning',
    frequency: 'daily',
    config: {
      threshold_days: 30,
      grace_period_days: 5
    },
    send_email: true,
    send_in_app: true,
    send_sms: false,
    is_active: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialAlert) {
      setFormData({
        alert_type: initialAlert.alert_type || 'red_kpi',
        severity: initialAlert.severity || 'warning',
        frequency: initialAlert.frequency || 'daily',
        config: initialAlert.config || { threshold_days: 30, grace_period_days: 5 },
        send_email: initialAlert.send_email !== false,
        send_in_app: initialAlert.send_in_app !== false,
        send_sms: initialAlert.send_sms || false,
        is_active: initialAlert.is_active !== false
      });
    }
  }, [initialAlert]);

  const alertTypes = [
    { value: 'red_kpi', label: 'Red KPI Alert', description: 'Alert when KPI falls below 50%' },
    { value: 'missing_data', label: 'Missing Data Alert', description: 'Alert when data is not submitted on time' },
    { value: 'pending_approval', label: 'Pending Approval', description: 'Alert for pending validation requests' },
    { value: 'submission_due', label: 'Submission Due', description: 'Reminder for upcoming submissions' },
    { value: 'tenant_expiry', label: 'Tenant Expiry', description: 'Alert when subscription is expiring' }
  ];

  const severityOptions = [
    { value: 'critical', label: 'Critical', color: '#ef4444' },
    { value: 'warning', label: 'Warning', color: '#f59e0b' },
    { value: 'info', label: 'Info', color: '#3b82f6' }
  ];

  const frequencyOptions = [
    { value: 'realtime', label: 'Real-time' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleConfigChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (formData.alert_type === 'red_kpi' && formData.config.threshold_days < 1) {
      newErrors.threshold_days = 'Threshold days must be at least 1';
    }
    if (formData.alert_type === 'missing_data' && formData.config.grace_period_days < 1) {
      newErrors.grace_period_days = 'Grace period must be at least 1 day';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSave(formData);
    if (!initialAlert) {
      setFormData({
        alert_type: 'red_kpi',
        severity: 'warning',
        frequency: 'daily',
        config: { threshold_days: 30, grace_period_days: 5 },
        send_email: true,
        send_in_app: true,
        send_sms: false,
        is_active: true
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
            {initialAlert ? 'Edit Alert' : 'Create New Alert'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>
        
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Alert Type
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alertTypes.map(type => (
                <label key={type.value} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  border: formData.alert_type === type.value ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: formData.alert_type === type.value ? '#eff6ff' : 'white'
                }}>
                  <input
                    type="radio"
                    value={type.value}
                    checked={formData.alert_type === type.value}
                    onChange={() => handleChange('alert_type', type.value)}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>{type.label}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Severity
              </label>
              <select
                value={formData.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {severityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => handleChange('frequency', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {frequencyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {formData.alert_type === 'red_kpi' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Threshold Days
              </label>
              <input
                type="number"
                value={formData.config.threshold_days}
                onChange={(e) => handleConfigChange('threshold_days', parseInt(e.target.value))}
                min="1"
                max="90"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${errors.threshold_days ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              {errors.threshold_days && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  <FiAlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {errors.threshold_days}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Alert when KPI remains red for this many consecutive days
              </div>
            </div>
          )}
          
          {formData.alert_type === 'missing_data' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Grace Period (Days)
              </label>
              <input
                type="number"
                value={formData.config.grace_period_days}
                onChange={(e) => handleConfigChange('grace_period_days', parseInt(e.target.value))}
                min="1"
                max="15"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${errors.grace_period_days ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              {errors.grace_period_days && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                  <FiAlertCircle size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {errors.grace_period_days}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Alert when data is missing after this many days into the month
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
              Notification Channels
            </label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.send_email}
                  onChange={(e) => handleChange('send_email', e.target.checked)}
                />
                <span>📧 Email</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.send_in_app}
                  onChange={(e) => handleChange('send_in_app', e.target.checked)}
                />
                <span>📱 In-App</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.send_sms}
                  onChange={(e) => handleChange('send_sms', e.target.checked)}
                />
                <span>📲 SMS</span>
              </label>
            </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
              />
              <span>Enable this alert</span>
            </label>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '10px',
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
              <FiSave size={16} />
              {loading ? 'Saving...' : initialAlert ? 'Update Alert' : 'Create Alert'}
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

AlertConfigModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialAlert: PropTypes.object,
  loading: PropTypes.bool
};