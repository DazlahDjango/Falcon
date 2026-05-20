import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const ExportButton = ({ onExport, formats = ['pdf', 'excel', 'csv'], isLoading = false, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatLabels = {
    pdf: 'PDF Document',
    excel: 'Excel Spreadsheet',
    csv: 'CSV File',
    png: 'PNG Image'
  };

  const handleExport = async (format) => {
    setIsOpen(false);
    if (onExport) {
      await onExport(format);
    }
  };

  return (
    <div className={`export-button ${className}`} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          background: 'white',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          opacity: isLoading ? 0.6 : 1
        }}
      >
        {isLoading ? '⏳ Exporting...' : '📥 Export'}
        <span>▼</span>
      </button>
      
      {isOpen && (
        <div 
          className="export-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
            zIndex: 1000,
            minWidth: '160px'
          }}
        >
          {formats.map(format => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {formatLabels[format] || format.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

ExportButton.propTypes = {
  onExport: PropTypes.func.isRequired,
  formats: PropTypes.arrayOf(PropTypes.oneOf(['pdf', 'excel', 'csv', 'png'])),
  isLoading: PropTypes.bool,
  className: PropTypes.string
};