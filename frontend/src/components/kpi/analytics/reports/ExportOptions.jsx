import React from 'react';
import { FiFile, FiFileText, FiFilePlus } from 'react-icons/fi';

const ExportOptions = ({ selectedFormat, onSelect }) => {
    const formats = [
        { value: 'pdf', label: 'PDF Document', icon: <FiFileText size={16} />, desc: 'Print-ready format' },
        { value: 'excel', label: 'Excel Spreadsheet', icon: <FiFilePlus size={16} />, desc: 'Editable data' },
        { value: 'csv', label: 'CSV File', icon: <FiFile size={16} />, desc: 'Raw data export' }
    ];
    
    return (
        <div style={{ marginBottom: 'var(--kpi-space-6)' }}>
            <h4 style={{ marginBottom: 'var(--kpi-space-4)', fontSize: '0.875rem' }}>Export Format</h4>
            <div style={{ display: 'flex', gap: 'var(--kpi-space-4)', flexWrap: 'wrap' }}>
                {formats.map(format => (
                    <div 
                        key={format.value}
                        onClick={() => onSelect(format.value)}
                        style={{
                            flex: 1,
                            minWidth: 120,
                            padding: 'var(--kpi-space-4)',
                            border: `2px solid ${selectedFormat === format.value ? 'var(--kpi-primary)' : 'var(--kpi-gray-200)'}`,
                            borderRadius: 'var(--kpi-radius-lg)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            background: selectedFormat === format.value ? 'var(--kpi-info-bg)' : 'white'
                        }}
                    >
                        <div style={{ color: 'var(--kpi-primary)', marginBottom: 'var(--kpi-space-2)' }}>{format.icon}</div>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{format.label}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--kpi-gray-500)' }}>{format.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExportOptions;