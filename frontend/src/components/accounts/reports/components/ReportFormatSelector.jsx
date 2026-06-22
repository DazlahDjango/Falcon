import React from 'react';
import { FiFileText, FiFile, FiCheckCircle, FiDownload, FiEye, FiEyeOff } from 'react-icons/fi';

const ReportFormatSelector = ({ 
    format, onFormatChange, 
    selectedColumns, onColumnToggle,
    includeMetadata, onIncludeMetadataChange,
    includeChanges, onIncludeChangesChange 
}) => {
    const formats = [
        { id: 'csv', name: 'CSV', icon: <FiFileText size={20} />, description: 'Comma-separated values, compatible with Excel' },
        { id: 'json', name: 'JSON', icon: <FiFile size={20} />, description: 'JSON format for developers and API integration' },
        { id: 'excel', name: 'Excel', icon: <FiDownload size={20} />, description: 'Microsoft Excel format (.xlsx)' },
    ];

    const columnOptions = [
        { id: 'timestamp', label: 'Timestamp', icon: <FiFileText size={12} /> },
        { id: 'user', label: 'User', icon: <FiFileText size={12} /> },
        { id: 'action', label: 'Action', icon: <FiFileText size={12} /> },
        { id: 'action_type', label: 'Action Type', icon: <FiFileText size={12} /> },
        { id: 'severity', label: 'Severity', icon: <FiFileText size={12} /> },
        { id: 'ip_address', label: 'IP Address', icon: <FiFileText size={12} /> },
    ];

    const handleSelectAllColumns = () => {
        const allSelected = Object.values(selectedColumns).every(v => v === true);
        const newState = {};
        Object.keys(selectedColumns).forEach(key => {
            newState[key] = !allSelected;
        });
        Object.keys(newState).forEach(key => onColumnToggle(key));
    };

    return (
        <div className="report-section">
            <label className="section-label">Export Format</label>
            <div className="format-options">
                {formats.map(f => (
                    <label
                        key={f.id}
                        className={`format-option ${format === f.id ? 'selected' : ''}`}
                    >
                        <input
                            type="radio"
                            name="format"
                            value={f.id}
                            checked={format === f.id}
                            onChange={(e) => onFormatChange(e.target.value)}
                        />
                        <div className="format-icon">{f.icon}</div>
                        <div className="format-info">
                            <strong>{f.name}</strong>
                            <span>{f.description}</span>
                        </div>
                        {format === f.id && <FiCheckCircle className="format-check" />}
                    </label>
                ))}
            </div>

            {format === 'csv' && (
                <>
                    <div className="section-header">
                        <label className="section-label">Columns to Include</label>
                        <button className="select-all-btn" onClick={handleSelectAllColumns}>
                            {Object.values(selectedColumns).every(v => v === true) ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>
                    <div className="columns-grid">
                        {columnOptions.map(column => (
                            <label key={column.id} className="column-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedColumns[column.id]}
                                    onChange={() => onColumnToggle(column.id)}
                                />
                                <span className="checkbox-custom"></span>
                                <span className="checkbox-label">
                                    {column.icon}
                                    {column.label}
                                </span>
                            </label>
                        ))}
                    </div>

                    <div className="options-list">
                        <label className="option-checkbox">
                            <input
                                type="checkbox"
                                checked={includeMetadata}
                                onChange={(e) => onIncludeMetadataChange(e.target.checked)}
                            />
                            <span className="checkbox-custom"></span>
                            <span>Include metadata (request details, user agent)</span>
                        </label>
                        <label className="option-checkbox">
                            <input
                                type="checkbox"
                                checked={includeChanges}
                                onChange={(e) => onIncludeChangesChange(e.target.checked)}
                            />
                            <span className="checkbox-custom"></span>
                            <span>Include change history (old/new values)</span>
                        </label>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReportFormatSelector;