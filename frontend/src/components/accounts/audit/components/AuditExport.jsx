import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiDownload, FiFileText, FiFile, FiX } from 'react-icons/fi';
import Modal from '../../../common/UI/Modal';
import { exportAuditLogs } from '../../../../store/accounts/slice/auditSlice';
import { showAlert } from '../../../../store/accounts/slice/uiSlice';

const AuditExport = ({ isOpen, onClose, filters }) => {
    const dispatch = useDispatch();
    const [format, setFormat] = useState('csv');
    const [isExporting, setIsExporting] = useState(false);
    const formats = [
        { id: 'csv', name: 'CSV', icon: <FiFileText size={20} />, description: 'Comma-separated values, compatible with Excel' },
        { id: 'json', name: 'JSON', icon: <FiFile size={20} />, description: 'JSON format for developers' },
        { id: 'excel', name: 'Excel', icon: <FiFile size={20} />, description: 'Microsoft Excel format (.xlsx)' }
    ];
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await dispatch(exportAuditLogs({ format, filters })).unwrap();
            // Create download link
            const blob = new Blob([result.data], { type: result.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit_logs_${new Date().toISOString().slice(0, 19)}.${format === 'excel' ? 'xlsx' : format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            dispatch(showAlert({ type: 'success', message: 'Export completed' }));
            onClose();
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Export failed' }));
        } finally {
            setIsExporting(false);
        }
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Export Audit Logs" size="sm">
            <div className="audit-export-modal">
                <p className="export-description">
                    Export audit logs based on current filters. The export will include all logs matching your criteria.
                </p>
                <div className="export-formats">
                    {formats.map(f => (
                        <label key={f.id} className={`format-option ${format === f.id ? 'selected' : ''}`}>
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
                <div className="export-actions">
                    <button className="btn btn-secondary" onClick={onClose} disabled={isExporting}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleExport} disabled={isExporting}>
                        <FiDownload size={16} />
                        {isExporting ? 'Exporting...' : 'Export'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
export default AuditExport;