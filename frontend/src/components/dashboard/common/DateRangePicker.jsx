import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export const DateRangePicker = ({ value, onChange, className = '', presets = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(value?.start || null);
  const [endDate, setEndDate] = useState(value?.end || null);
  const pickerRef = useRef(null);

  const presetsList = [
    { label: 'Today', getValue: () => ({ start: new Date(), end: new Date() }) },
    { label: 'This Week', getValue: () => {
      const now = new Date();
      const start = new Date(now.setDate(now.getDate() - now.getDay()));
      return { start, end: new Date() };
    }},
    { label: 'This Month', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: new Date() };
    }},
    { label: 'Last 30 Days', getValue: () => {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { start, end: new Date() };
    }},
    { label: 'This Quarter', getValue: () => {
      const now = new Date();
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      return { start: quarterStart, end: new Date() };
    }},
    { label: 'This Year', getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      return { start, end: new Date() };
    }}
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return '—';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleApply = () => {
    if (startDate && endDate && startDate <= endDate) {
      onChange({ start: startDate, end: endDate });
      setIsOpen(false);
    }
  };

  const handlePreset = (preset) => {
    const { start, end } = preset.getValue();
    setStartDate(start);
    setEndDate(end);
    onChange({ start, end });
    setIsOpen(false);
  };

  return (
    <div className={`date-range-picker ${className}`} ref={pickerRef}>
      <button 
        className="date-range-picker__trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>📅</span>
        <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
        <span>▼</span>
      </button>

      {isOpen && (
        <div 
          className="date-range-picker__dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            padding: '16px',
            zIndex: 1000,
            minWidth: '300px'
          }}
        >
          {presets && (
            <div className="presets" style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Quick Select</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {presetsList.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => handlePreset(preset)}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      borderRadius: '9999px',
                      border: '1px solid #e5e7eb',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="custom-range" style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Custom Range</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="date"
                value={startDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                style={{ flex: 1, padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
              <span>to</span>
              <input
                type="date"
                value={endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                style={{ flex: 1, padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              style={{ padding: '6px 12px', borderRadius: '6px', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer' }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

DateRangePicker.propTypes = {
  value: PropTypes.shape({
    start: PropTypes.instanceOf(Date),
    end: PropTypes.instanceOf(Date)
  }),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  presets: PropTypes.bool
};