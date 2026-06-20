import React from 'react';
import { FiAlertCircle, FiXCircle, FiDownload } from 'react-icons/fi';

const UploadErrors = ({ errors, onDownload, onClose }) => {
    const groupedErrors = errors?.reduce((acc, err) => {
        acc[err.error] = (acc[err.error] || 0) + 1;
        return acc;
    }, {});
    
    return (
        <div className="upload-errors-modal">
            <div className="upload-errors-container">
                <div className="upload-errors-header">
                    <FiAlertCircle size={24} color="var(--kpi-danger)" />
                    <h3>Validation Errors</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="upload-errors-body">
                    <div className="errors-summary">
                        <span className="error-count">{errors?.length || 0} errors found</span>
                        <button className="download-btn" onClick={onDownload}>
                            <FiDownload size={14} />
                            Download Report
                        </button>
                    </div>
                    
                    <div className="errors-grouped">
                        <h4>Error Summary</h4>
                        {Object.entries(groupedErrors || {}).map(([message, count]) => (
                            <div key={message} className="error-group">
                                <FiXCircle size={14} />
                                <span className="error-message">{message}</span>
                                <span className="error-count-badge">{count}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="errors-list-full">
                        <h4>Detailed Errors</h4>
                        <div className="errors-table-container">
                            <table className="errors-table">
                                <thead>
                                    <tr>
                                        <th>Row</th>
                                        <th>Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {errors?.map((error, index) => (
                                        <tr key={index}>
                                            <td>{error.row}</td>
                                            <td>{error.error}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div className="upload-errors-footer">
                    <button className="close-modal-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default UploadErrors;