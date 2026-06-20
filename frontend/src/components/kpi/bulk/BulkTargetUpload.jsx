import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';
import { uploadTargets } from '../../../store/kpi';
import UploadResults from './UploadResults';
import TemplateDownload from './TemplateDownload';

const BulkTargetUpload = ({ onComplete, setUploading }) => {
    const dispatch = useDispatch();
    const [file, setFile] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [dryRun, setDryRun] = useState(true);
    const [uploadResult, setUploadResult] = useState(null);
    
    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile && (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx'))) {
            setFile(selectedFile);
        } else {
            alert('Please upload a CSV or Excel file');
        }
    }, []);
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
        maxFiles: 1
    });
    
    const handleUpload = async () => {
        setUploading(true);
        const result = await dispatch(uploadTargets({ file, year, dryRun })).unwrap();
        setUploadResult(result);
        setUploading(false);
        onComplete?.(result);
    };
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear + i);
    
    return (
        <div className="bulk-upload-section">
            {!uploadResult ? (
                <div>
                    <div className="bulk-upload-header">
                        <h3>Bulk Target Upload</h3>
                        <p>Upload annual targets for multiple users at once</p>
                    </div>
                    
                    <div className="bulk-upload-requirements">
                        <h4>File Requirements</h4>
                        <ul>
                            <li>CSV or Excel (.xlsx) format</li>
                            <li>Maximum file size: 10MB</li>
                            <li>Required columns: kpi_id, user_id, target_value</li>
                            <li>Optional columns: notes</li>
                        </ul>
                    </div>
                    
                    <div className="bulk-template-download">
                        <TemplateDownload type="target" />
                    </div>
                    
                    <div className="bulk-period-select">
                        <div className="form-group">
                            <label>Target Year <span className="required">*</span></label>
                            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div 
                        {...getRootProps()} 
                        className={`bulk-dropzone ${isDragActive ? 'drag-active' : ''}`}
                    >
                        <input {...getInputProps()} />
                        <FiUpload size={32} />
                        <p>{isDragActive ? 'Drop file here...' : 'Drag & drop file here or click to browse'}</p>
                        <span>Supports CSV, XLSX (Max 10MB)</span>
                    </div>
                    
                    <div className="bulk-dry-run-toggle">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
                            Dry Run (Validate only, don't save)
                        </label>
                    </div>
                    
                    <div className="bulk-actions">
                        <button 
                            className="bulk-next-btn"
                            onClick={handleUpload}
                            disabled={!file}
                        >
                            Upload Targets →
                        </button>
                    </div>
                </div>
            ) : (
                <UploadResults 
                    result={uploadResult}
                    onReset={() => {
                        setFile(null);
                        setUploadResult(null);
                    }}
                    onNewUpload={() => {
                        setFile(null);
                        setUploadResult(null);
                    }}
                />
            )}
        </div>
    );
};

export default BulkTargetUpload;