import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiDownload, FiRefreshCw } from 'react-icons/fi';

const UploadResults = ({ result, onReset, onNewUpload }) => {
    const hasErrors = result?.errors && result.errors.length > 0;
    const successCount = result?.created || 0;
    const updateCount = result?.updated || 0;
    const errorCount = result?.errors?.length || 0;
    const totalRows = result?.total_rows || successCount + errorCount;
    
    const downloadErrorReport = () => {
        const csvContent = result.errors.map(err => `${err.row},${err.error}`).join('\n');
        const blob = new Blob([`Row,Error\n${csvContent}`], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'upload_errors.csv';
        a.click();
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="upload-results">
            <div className={`upload-results-header ${hasErrors ? 'has-errors' : 'success'}`}>
                {hasErrors ? (
                    <FiAlertCircle size={48} />
                ) : (
                    <FiCheckCircle size={48} />
                )}
                <h3>{hasErrors ? 'Upload Completed with Errors' : 'Upload Successful'}</h3>
                <p>
                    {hasErrors 
                        ? `Processed ${totalRows} records with ${errorCount} error(s)`
                        : `Successfully processed ${totalRows} records`
                    }
                </p>
            </div>
            
            <div className="upload-results-stats">
                <div className="result-stat success">
                    <FiCheckCircle size={20} />
                    <div>
                        <div className="stat-value">{successCount}</div>
                        <div className="stat-label">Created</div>
                    </div>
                </div>
                <div className="result-stat info">
                    <FiRefreshCw size={20} />
                    <div>
                        <div className="stat-value">{updateCount}</div>
                        <div className="stat-label">Updated</div>
                    </div>
                </div>
                <div className="result-stat error">
                    <FiXCircle size={20} />
                    <div>
                        <div className="stat-value">{errorCount}</div>
                        <div className="stat-label">Errors</div>
                    </div>
                </div>
            </div>
            
            {hasErrors && (
                <div className="upload-errors-section">
                    <div className="errors-header">
                        <h4>Error Details</h4>
                        <button className="download-errors-btn" onClick={downloadErrorReport}>
                            <FiDownload size={14} />
                            Download Error Report
                        </button>
                    </div>
                    <div className="errors-list">
                        {result.errors.slice(0, 10).map((error, index) => (
                            <div key={index} className="error-item">
                                <span className="error-row">Row {error.row}:</span>
                                <span className="error-message">{error.error}</span>
                            </div>
                        ))}
                        {result.errors.length > 10 && (
                            <div className="error-more">
                                + {result.errors.length - 10} more errors
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {result.dry_run && (
                <div className="upload-dry-run-notice">
                    <FiAlertCircle size={16} />
                    <span>This was a dry run. No data was saved to the database.</span>
                </div>
            )}
            
            <div className="upload-results-actions">
                <button className="results-reset-btn" onClick={onReset}>
                    Try Again
                </button>
                <button className="results-new-btn" onClick={onNewUpload}>
                    Upload Another File
                </button>
            </div>
        </div>
    );
};

export default UploadResults;