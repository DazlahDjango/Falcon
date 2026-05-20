import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiSave } from 'react-icons/fi';

export const SaveComparisonModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialName = '',
  initialType = 'mom',
  loading = false
}) => {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState(initialType);
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState('');

  const comparisonTypes = [
    { value: 'mom', label: 'Month over Month', description: 'Compare current month with previous month' },
    { value: 'qoq', label: 'Quarter over Quarter', description: 'Compare current quarter with previous quarter' },
    { value: 'yoy', label: 'Year over Year', description: 'Compare current year with previous year' }
  ];

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a name for this comparison');
      return;
    }
    setError('');
    await onSave({ name: name.trim(), comparison_type: type, is_public: isPublic });
    setName('');
    setType('mom');
    setIsPublic(false);
  };

  const handleClose = () => {
    setName('');
    setType('mom');
    setIsPublic(false);
    setError('');
    onClose();
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
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '500px',
        animation: 'slideUp 0.3s ease'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            Save Comparison
          </h3>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Comparison Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Q1 vs Q2 Performance"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${error ? '#ef4444' : '#e2e8f0'}`,
                borderRadius: '8px',
                fontSize: '14px'
              }}
              autoFocus
            />
            {error && <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{error}</div>}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              Comparison Type
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {comparisonTypes.map(ct => (
                <label key={ct.value} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  border: type === ct.value ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: type === ct.value ? '#eff6ff' : 'white'
                }}>
                  <input
                    type="radio"
                    value={ct.value}
                    checked={type === ct.value}
                    onChange={() => setType(ct.value)}
                    style={{ marginTop: '2px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>{ct.label}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{ct.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px' }}>Make this comparison public to other users</span>
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
              {loading ? 'Saving...' : 'Save Comparison'}
            </button>
            <button
              onClick={handleClose}
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
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

SaveComparisonModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  initialName: PropTypes.string,
  initialType: PropTypes.string,
  loading: PropTypes.bool
};