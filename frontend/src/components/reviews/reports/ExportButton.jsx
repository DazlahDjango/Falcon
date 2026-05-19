// src/components/reviews/reports/ExportButton.jsx
import React, { useState } from 'react';
import './reports.css';

const ExportButton = ({ onExport, formats = ['csv', 'excel', 'pdf'], isLoading = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    const formatLabels = {
        csv: 'CSV (Spreadsheet)',
        excel: 'Excel (.xlsx)',
        pdf: 'PDF Document',
        json: 'JSON Data',
    };

    const handleExport = (format) => {
        setIsOpen(false);
        onExport(format);
    };

    return (
        <div className="export-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
            <button 
                className="btn-outline" 
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
            >
                {isLoading ? 'Exporting...' : '📥 Export'}
            </button>
            {isOpen && (
                <div className="export-dropdown-content" style={{ 
                    display: 'block', 
                    position: 'absolute', 
                    right: 0, 
                    background: 'white',
                    minWidth: '160px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    zIndex: 10
                }}>
                    {formats.map(format => (
                        <button
                            key={format}
                            className="export-option"
                            onClick={() => handleExport(format)}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '0.5rem 1rem',
                                textAlign: 'left',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.875rem'
                            }}
                        >
                            {formatLabels[format] || format.toUpperCase()}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExportButton;