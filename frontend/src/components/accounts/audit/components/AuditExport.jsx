import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    FiDownload, FiFileText, FiFile, FiX, FiCheckCircle,
    FiCalendar, FiFilter, FiUser, FiShield, FiAlertCircle
} from 'react-icons/fi';
import Modal from '../../../common/UI/Modal';
import { exportAuditLogs } from '../../../../store/accounts/slice/auditSlice';
import { showAlert } from '../../../../store/accounts/slice/uiSlice';
import Spinner from '../../../common/UI/Spinner';

const AuditExport = ({ isOpen, onClose, filters, totalCount }) => {
    const dispatch = useDispatch();
    const [format, setFormat] = useState('csv');
    const [dateRange, setDateRange] = useState({
        start_date: filters.start_date || '',
        end_date: filters.end_date || ''
    });
    const [includeMetadata, setIncludeMetadata] = useState(true);
    const [includeChanges, setIncludeChanges] = useState(true);
    const [selectedColumns, setSelectedColumns] = useState({
        timestamp: true,
        user: true,
        action: true,
        action_type: true,
        severity: true,
        ip_address: true,
    });
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    const formats = [
        {
            id: 'csv',
            name: 'CSV',
            icon: <FiFileText size={24} />,
            description: 'Comma-separated values, compatible with Excel',
            extension: '.csv',
        },
        {
            id: 'json',
            name: 'JSON',
            icon: <FiFile size={24} />,
            description: 'JSON format for developers',
            extension: '.json',
        },
    ];

    const columnOptions = [
        { id: 'timestamp', label: 'Timestamp', icon: <FiCalendar size={12} /> },
        { id: 'user', label: 'User', icon: <FiUser size={12} /> },
        { id: 'action', label: 'Action', icon: <FiAlertCircle size={12} /> },
        { id: 'action_type', label: 'Action Type', icon: <FiFilter size={12} /> },
        { id: 'severity', label: 'Severity', icon: <FiShield size={12} /> },
        { id: 'ip_address', label: 'IP Address', icon: <FiShield size={12} /> },
    ];

    const handleColumnToggle = (columnId) => {
        setSelectedColumns(prev => ({ ...prev, [columnId]: !prev[columnId] }));
    };

    const handleSelectAllColumns = () => {
        const allSelected = Object.values(selectedColumns).every(v => v === true);
        const newState = {};
        Object.keys(selectedColumns).forEach(key => {
            newState[key] = !allSelected;
        });
        setSelectedColumns(newState);
    };

    const handleExport = async () => {
        setIsExporting(true);
        setExportProgress(0);

        try {
            const progressInterval = setInterval(() => {
                setExportProgress(prev => Math.min(prev + 10, 90));
            }, 500);

            const exportData = {
                format,
                filters: {
                    ...filters,
                    start_date: dateRange.start_date,
                    end_date: dateRange.end_date,
                },
                options: {
                    include_metadata: includeMetadata,
                    include_changes: includeChanges,
                    columns: Object.keys(selectedColumns).filter(key => selectedColumns[key]),
                },
            };

            const result = await dispatch(exportAuditLogs(exportData)).unwrap();
            clearInterval(progressInterval);
            setExportProgress(100);

            const selectedFormat = formats.find(f => f.id === format);
            const blob = new Blob([result.data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            a.download = `audit_logs_${timestamp}${selectedFormat.extension}`;
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            dispatch(showAlert({ type: 'success', message: `Export completed: ${totalCount || 0} records exported` }));
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Export failed' }));
        } finally {
            setIsExporting(false);
            setExportProgress(0);
        }
    };

    const handleQuickDateRange = (range) => {
        const today = new Date();
        let startDate = new Date();

        switch (range) {
            case 'today':
                startDate = today;
                break;
            case 'week':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(today.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(today.getFullYear() - 1);
                break;
        }

        setDateRange({
            start_date: startDate.toISOString().split('T')[0],
            end_date: today.toISOString().split('T')[0]
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Export Audit Logs" size="lg">
            <div className="audit-export-modal">
                <div className="export-info-banner">
                    <div className="info-icon"><FiDownload size={20} /></div>
                    <div className="info-text">
                        <strong>Export {totalCount?.toLocaleString() || 'filtered'} records</strong>
                    </div>
                </div>

                <div className="export-section">
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
                                    onChange={(e) => setFormat(e.target.value)}
                                />
                                <div className="format-icon">{f.icon}</div>
                                <div className="format-info">
                                    <strong>{f.name}</strong>
                                    <span>{f.description}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="export-section">
                    <label className="section-label">Date Range</label>
                    <div className="date-range-actions">
                        <button className="date-range-btn" onClick={() => handleQuickDateRange('today')}>Today</button>
                        <button className="date-range-btn" onClick={() => handleQuickDateRange('week')}>Last 7 Days</button>
                        <button className="date-range-btn" onClick={() => handleQuickDateRange('month')}>Last 30 Days</button>
                        <button className="date-range-btn" onClick={() => handleQuickDateRange('quarter')}>Last 90 Days</button>
                        <button className="date-range-btn" onClick={() => handleQuickDateRange('year')}>Last Year</button>
                    </div>
                    <div className="date-range-inputs">
                        <input
                            type="date"
                            value={dateRange.start_date}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                        <span className="date-separator">to</span>
                        <input
                            type="date"
                            value={dateRange.end_date}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="export-section">
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
                                    onChange={() => handleColumnToggle(column.id)}
                                />
                                <span className="checkbox-custom"></span>
                                <span className="checkbox-label">
                                    {column.icon}
                                    {column.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="export-section">
                    <label className="section-label">Additional Options</label>
                    <div className="options-list">
                        <label className="option-checkbox">
                            <input
                                type="checkbox"
                                checked={includeMetadata}
                                onChange={(e) => setIncludeMetadata(e.target.checked)}
                            />
                            <span className="checkbox-custom"></span>
                            <span>Include metadata (request details)</span>
                        </label>
                        <label className="option-checkbox">
                            <input
                                type="checkbox"
                                checked={includeChanges}
                                onChange={(e) => setIncludeChanges(e.target.checked)}
                            />
                            <span className="checkbox-custom"></span>
                            <span>Include change history</span>
                        </label>
                    </div>
                </div>

                {isExporting && (
                    <div className="export-progress">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${exportProgress}%` }} />
                        </div>
                        <p>Processing export... {exportProgress}%</p>
                    </div>
                )}

                <div className="export-actions">
                    <button className="btn btn-secondary" onClick={onClose} disabled={isExporting}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <Spinner size="sm" /> : <FiDownload size={16} />}
                        {isExporting ? 'Exporting...' : `Export ${totalCount?.toLocaleString() || ''} Records`}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AuditExport;