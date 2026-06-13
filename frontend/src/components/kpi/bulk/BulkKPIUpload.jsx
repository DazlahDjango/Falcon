import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import { uploadKPIs, selectUploadResult, selectUploading } from '../../../store/kpi';
import UploadPreview from './UploadPreview';
import UploadResults from './UploadResults';
import TemplateDownload from './TemplateDownload';
import { fetchFrameworks, selectFrameworks } from '../../../store/kpi';

const BulkKPIUpload = ({ onComplete, setUploading }) => {
    const dispatch = useDispatch();
    const [file, setFile] = useState(null);
    const [frameworkId, setFrameworkId] = useState('');
    const [dryRun, setDryRun] = useState(true);
    const [preview, setPreview] = useState(null);
    const [step, setStep] = useState(1);
    
    const frameworks = useSelector(selectFrameworks);
    const uploadResult = useSelector(selectUploadResult);
    const uploading = useSelector(selectUploading);
    
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
    
    const handlePreview = async () => {
        setUploading(true);
        // Simulate preview - in real implementation, parse file and show preview
        setPreview({ total_rows: 50, columns: ['name', 'code', 'type', 'unit'] });
        setUploading(false);
        setStep(3);
    };
    
    const handleUpload = async () => {
        setUploading(true);
        const result = await dispatch(uploadKPIs({ file, frameworkId, dryRun })).unwrap();
        setUploading(false);
        onComplete?.(result);
        setStep(4);
    };
    
    const handleReset = () => {
        setFile(null);
        setFrameworkId('');
        setPreview(null);
        setStep(1);
    };
    
    return (
        <div className="bulk-upload-section">
            {step === 1 && (
                <div>
                    <div className="bulk-upload-header">
                        <h3>Bulk KPI Upload</h3>
                        <p>Upload multiple KPIs at once using a CSV or Excel file</p>
                    </div>
                    
                    <div className="bulk-upload-requirements">
                        <h4>File Requirements</h4>
                        <ul>
                            <li>CSV or Excel (.xlsx) format</li>
                            <li>Maximum file size: 10MB</li>
                            <li>Required columns: name, code, kpi_type, framework_id</li>
                            <li>Optional columns: description, unit, target_min, target_max</li>
                        </ul>
                    </div>
                    
                    <div className="bulk-template-download">
                        <TemplateDownload type="kpi" />
                    </div>
                    
                    <div className="bulk-framework-select">
                        <label>Select Framework <span className="required">*</span></label>
                        <select 
                            value={frameworkId}
                            onChange={(e) => setFrameworkId(e.target.value)}
                        >
                            <option value="">Select a framework...</option>
                            {frameworks?.map(fw => (
                                <option key={fw.id} value={fw.id}>{fw.name}</option>
                            ))}
                        </select>
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
                            <input 
                                type="checkbox" 
                                checked={dryRun} 
                                onChange={(e) => setDryRun(e.target.checked)} 
                            />
                            Dry Run (Validate only, don't save)
                        </label>
                        <small>Preview errors before actual upload</small>
                    </div>
                    
                    <div className="bulk-actions">
                        <button 
                            className="bulk-next-btn"
                            onClick={handlePreview}
                            disabled={!file || !frameworkId}
                        >
                            Preview Upload →
                        </button>
                    </div>
                </div>
            )}
            
            {step === 2 && file && (
                <UploadPreview 
                    file={file}
                    onConfirm={handleUpload}
                    onBack={() => setStep(1)}
                    loading={uploading}
                />
            )}
            
            {step === 3 && uploadResult && (
                <UploadResults 
                    result={uploadResult}
                    onReset={handleReset}
                    onNewUpload={() => setStep(1)}
                />
            )}
        </div>
    );
};

export default BulkKPIUpload;