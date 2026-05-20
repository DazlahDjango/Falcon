import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiSave, FiClock, FiMail, FiFilter } from 'react-icons/fi';

export const ExportConfigModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialExport = null,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    dashboard_type: 'executive',
    format: 'pdf',
    schedule_type: 'weekly',
    schedule_config: {
      day_of_week: 1,
      time_of_day: '08:00'
    },
    recipients: [],
    filters: {},
    is_active: true
  });

  const [newRecipient, setNewRecipient] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialExport) {
      setFormData({
        name: initialExport.name || '',
        dashboard_type: initialExport.dashboard_type || 'executive',
        format: initialExport.format || 'pdf',
        schedule_type: initialExport.schedule_type || 'weekly',
        schedule_config: initialExport.schedule_config || { day_of_week: 1, time_of_day: '08:00' },
        recipients: initialExport.recipients || [],
        filters: initialExport.filters || {},
        is_active: initialExport.is_active !== false
      });
    }
  }, [initialExport]);

  const dashboardTypes = [
    { value: 'executive', label: 'Executive Dashboard' },
    { value: 'client_admin', label: 'Client Admin Dashboard' },
    { value: 'super_admin', label: 'Super Admin Dashboard' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'excel', label: 'Excel Spreadsheet' },
    { value: 'csv', label: 'CSV File' }
  ];

  const scheduleTypes = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const weekDays = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleScheduleConfigChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      schedule_config: { ...prev.schedule_config, [key]: value }
    }));
  };

  const addRecipient = () => {
    if (!newRecipient.trim()) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      setErrors({ ...errors, recipient: 'Invalid email address' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, newRecipient.trim()]
    }));
    setNewRecipient('');
    setErrors({ ...errors, recipient: null });
  };

  const removeRecipient = (email) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const handleFilterChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value }
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (formData.recipients.length === 0) {
      newErrors.recipients = 'At least one recipient is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSave(formData);
    if (!initialExport) {
      setFormData({
        name: '',
        dashboard_type: 'executive',
        format: 'pdf',
        schedule_type: 'weekly',
        schedule_config: { day_of_week: 1, time_of_day: '08:00' },
        recipients: [],
        filters: {},
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
        maxWidth: '600px',
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
            {initialExport ? 'Edit Export Schedule' : 'Create Export Schedule'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>
        
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Schedule Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Weekly Executive Report"
              style={{
                width: '100%',
                padding: '10px',
                border: `1px solid ${errors.name ? '#ef4444' : '#e2e8f0'}`,
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            {errors.name && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.name}</div>}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
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
                {dashboardTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => handleChange('format', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                {formats.map(format => (
                  <option key={format.value} value={format.value}>{format.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              <FiClock style={{ display: 'inline', marginRight: '6px' }} />
              Schedule
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <select
                value={formData.schedule_type}
                onChange={(e) => handleChange('schedule_type', e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                {scheduleTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              
              {formData.schedule_type === 'weekly' && (
                <select
                  value={formData.schedule_config.day_of_week}
                  onChange={(e) => handleScheduleConfigChange('day_of_week', parseInt(e.target.value))}
                  style={{
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  {weekDays.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              )}
              
              {formData.schedule_type === 'monthly' && (
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={formData.schedule_config.day_of_month || 1}
                  onChange={(e) => handleScheduleConfigChange('day_of_month', parseInt(e.target.value))}
                  style={{
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              )}
              
              <input
                type="time"
                value={formData.schedule_config.time_of_day || '08:00'}
                onChange={(e) => handleScheduleConfigChange('time_of_day', e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              <FiMail style={{ display: 'inline', marginRight: '6px' }} />
              Recipients
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="email"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                placeholder="email@example.com"
                style={{
                  flex: 1,
                  padding: '10px',
                  border: `1px solid ${errors.recipient ? '#ef4444' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
              />
              <button
                onClick={addRecipient}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
            {errors.recipient && <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>{errors.recipient}</div>}
            {errors.recipients && <div style={{ fontSize: '12px', color: '#ef4444', marginBottom: '8px' }}>{errors.recipients}</div>}
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {formData.recipients.map(email => (
                <span key={email} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px 4px 12px',
                  background: '#e2e8f0',
                  borderRadius: '20px',
                  fontSize: '12px'
                }}>
                  {email}
                  <button
                    onClick={() => removeRecipient(email)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#64748b'
                    }}
                  >
                    <FiX size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              <FiFilter style={{ display: 'inline', marginRight: '6px' }} />
              Filters (Optional)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <select
                value={formData.filters.period || 'monthly'}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
              
              <select
                value={formData.filters.department || ''}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                style={{
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="">All Departments</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="engineering">Engineering</option>
                <option value="finance">Finance</option>
                <option value="hr">Human Resources</option>
              </select>
            </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
              />
              <span>Active (scheduled exports will run automatically)</span>
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
              {loading ? 'Saving...' : initialExport ? 'Update Schedule' : 'Create Schedule'}
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

ExportConfigModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialExport: PropTypes.object,
  loading: PropTypes.bool
};