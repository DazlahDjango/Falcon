import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    FiDownload, FiFileText, FiFile, FiX, FiCheckCircle,
    FiUser, FiMail, FiBriefcase, FiCalendar, FiShield
} from 'react-icons/fi';
import Modal from '../../../common/UI/Modal';
import { showAlert } from '../../../../store/accounts/slice/uiSlice';
import Spinner from '../../../common/UI/Spinner';

const UserExport = ({ isOpen, onClose, users, totalCount }) => {
    const [format, setFormat] = useState('csv');
    const [isExporting, setIsExporting] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState({
        full_name: true,
        email: true,
        role: true,
        department: true,
        title: true,
        phone: true,
        status: true,
        mfa_enabled: true,
        created_at: true,
        last_login: true,
    });

    const formats = [
        { id: 'csv', name: 'CSV', icon: <FiFileText size={24} />, extension: '.csv' },
        { id: 'excel', name: 'Excel', icon: <FiFile size={24} />, extension: '.xlsx' },
    ];

    const columnOptions = [
        { id: 'full_name', label: 'Full Name', icon: <FiUser size={12} /> },
        { id: 'email', label: 'Email', icon: <FiMail size={12} /> },
        { id: 'role', label: 'Role', icon: <FiBriefcase size={12} /> },
        { id: 'department', label: 'Department', icon: <FiBriefcase size={12} /> },
        { id: 'title', label: 'Job Title', icon: <FiBriefcase size={12} /> },
        { id: 'phone', label: 'Phone', icon: <FiUser size={12} /> },
        { id: 'status', label: 'Status', icon: <FiShield size={12} /> },
        { id: 'mfa_enabled', label: 'MFA Status', icon: <FiShield size={12} /> },
        { id: 'created_at', label: 'Created Date', icon: <FiCalendar size={12} /> },
        { id: 'last_login', label: 'Last Login', icon: <FiCalendar size={12} /> },
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

    const convertToCSV = (data, columns) => {
        const selectedCols = Object.keys(columns).filter(key => columns[key]);
        const headers = selectedCols.map(col => {
            const option = columnOptions.find(opt => opt.id === col);
            return option?.label || col;
        });

        const rows = data.map(user => {
            return selectedCols.map(col => {
                switch (col) {
                    case 'full_name': return user.full_name || `${user.first_name} ${user.last_name}`;
                    case 'status': return user.is_active ? 'Active' : 'Inactive';
                    case 'mfa_enabled': return user.mfa_enabled ? 'Enabled' : 'Disabled';
                    case 'created_at': return new Date(user.created_at).toLocaleDateString();
                    case 'last_login': return user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never';
                    default: return user[col] || '';
                }
            }).map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
        });

        return [headers.join(','), ...rows].join('\n');
    };

    const handleExport = async () => {
        setIsExporting(true);

        try {
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            let blob;
            let filename;

            if (format === 'csv') {
                const csvData = convertToCSV(users, selectedColumns);
                blob = new Blob(["\uFEFF" + csvData], { type: 'text/csv;charset=utf-8;' });
                filename = `users_export_${timestamp}.csv`;
            } else {
                // For Excel, we'd use a library like xlsx
                // For now, use CSV as fallback
                const csvData = convertToCSV(users, selectedColumns);
                blob = new Blob(["\uFEFF" + csvData], { type: 'application/vnd.ms-excel' });
                filename = `users_export_${timestamp}.xls`;
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            dispatch(showAlert({ type: 'success', message: `Exported ${users.length} users successfully` }));
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Export failed' }));
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Export Users" size="md">
            <div className="user-export-modal">
                <div className="export-info-banner">
                    <div className="info-icon"><FiDownload size={20} /></div>
                    <div className="info-text">
                        <strong>Export {totalCount?.toLocaleString() || users.length} users</strong>
                        <p>Select format and columns to include</p>
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
                                </div>
                            </label>
                        ))}
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

                <div className="export-actions">
                    <button className="btn btn-secondary" onClick={onClose} disabled={isExporting}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? <Spinner size="sm" /> : <FiDownload size={16} />}
                        {isExporting ? 'Exporting...' : `Export ${users.length} Users`}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UserExport;