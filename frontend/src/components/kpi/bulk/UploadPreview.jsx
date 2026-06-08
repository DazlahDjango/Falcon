import React from 'react';
import { FiFile, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const UploadPreview = ({ file, data, onConfirm, onBack, loading }) => {
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    return (
        <div className="upload-preview">
            <div className="upload-preview-header">
                <h3>Preview Upload</h3>
                <p>Review your file before uploading</p>
            </div>
            
            <div className="upload-preview-file">
                <FiFile size={24} />
                <div>
                    <div className="file-name">{file?.name}</div>
                    <div className="file-size">{formatFileSize(file?.size)}</div>
                </div>
            </div>
            
            {data && (
                <div className="upload-preview-data">
                    <h4>File Summary</h4>
                    <div className="preview-stats">
                        <div className="preview-stat">
                            <span className="stat-label">Total Rows:</span>
                            <span className="stat-value">{data.total_rows}</span>
                        </div>
                        <div className="preview-stat">
                            <span className="stat-label">Columns:</span>
                            <span className="stat-value">{data.columns?.length}</span>
                        </div>
                        <div className="preview-stat">
                            <span className="stat-label">Valid Rows:</span>
                            <span className="stat-value">{data.valid_rows}</span>
                        </div>
                        <div className="preview-stat">
                            <span className="stat-label">Invalid Rows:</span>
                            <span className="stat-value">{data.invalid_rows}</span>
                        </div>
                    </div>
                    
                    {data.preview && (
                        <div className="preview-table-container">
                            <h4>Data Preview (First 5 rows)</h4>
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        {Object.keys(data.preview[0] || {}).map(key => (
                                            <th key={key}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.preview.slice(0, 5).map((row, idx) => (
                                        <tr key={idx}>
                                            {Object.values(row).map((val, i) => (
                                                <td key={i}>{String(val).substring(0, 50)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            
            <div className="upload-preview-actions">
                <button className="preview-back-btn" onClick={onBack}>
                    ← Back
                </button>
                <button className="preview-confirm-btn" onClick={onConfirm} disabled={loading}>
                    {loading ? 'Uploading...' : 'Confirm Upload'}
                </button>
            </div>
        </div>
    );
};

export default UploadPreview;