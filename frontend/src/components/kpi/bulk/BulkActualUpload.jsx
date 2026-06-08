import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';
import { uploadActuals } from '../../../store/kpi';
import UploadPreview from './UploadPreview';
import UploadResults from './UploadResults';
import TemplateDownload from './TemplateDownload';

const BulkActualUpload = ({ onComplete, setUploading }) => {
    const dispatch = useDispatch();
    const [file, setFile] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [dryRun, setDryRun] = useState(true);
    const [step, setStep] = useState(1);
    const [uploadResult, setUploadResult] = useState(null);
    
    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile && (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx'))) {
            setFile(selectedFile);
            setStep(2);
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
        const result = await dispatch(uploadActuals({ file, year, month, dryRun })).unwrap();
        setUploadResult(result);
        setUploading(false);
        onComplete?.(result);
        setStep(3);
    };
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];
    
    return (
        <div className="bulk-upload-section">
            {step === 1 && (
                <div>
                    <div className="bulk-upload-header">
                        <h3>Bulk Actual Data Upload</h3>
                        <p>Upload actual performance data for multiple users at once</p>
                    </div>
                    
                    <div className="bulk-upload-requirements">
                        <h4>File Requirements</h4>
                        <ul>
                            <li>CSV or Excel (.xlsx) format</li>
                            <li>Maximum file size: 10MB</li>
                            <li>Required columns: kpi_id, user_id, actual_value</li>
                            <li>Optional columns: notes, evidence_url</li>
                        </ul>
                    </div>
                    
                    <div className="bulk-template-download">
                        <TemplateDownload type="actual" />
                    </div>
                    
                    <div className="bulk-period-select">
                        <div className="form-group">
                            <label>Year <span className="required">*</span></label>
                            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Month <span className="required">*</span></label>
                            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
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
                            Upload & Validate →
                        </button>
                    </div>
                </div>
            )}
            
            {step === 2 && uploadResult && (
                <UploadResults 
                    result={uploadResult}
                    onReset={() => {
                        setFile(null);
                        setUploadResult(null);
                        setStep(1);
                    }}
                    onNewUpload={() => {
                        setFile(null);
                        setUploadResult(null);
                        setStep(1);
                    }}
                />
            )}
        </div>
    );
};

export default BulkActualUpload;