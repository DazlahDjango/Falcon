import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';
import { uploadKPIs, selectUploadResult, selectUploading } from '../../../store/kpi';
import UploadPreview from './UploadPreview';
import UploadResults from './UploadResults';
import TemplateDownload from './TemplateDownload';

// Steps: 1 = Select file, 2 = Preview & upload, 3 = Show results
const BulkKPIUpload = ({ onComplete, setUploading }) => {
    const dispatch = useDispatch();
    const [file, setFile] = useState(null);
    const [dryRun, setDryRun] = useState(true);
    const [step, setStep] = useState(1);
    const [fileError, setFileError] = useState(null);
    const [uploadResult, setUploadResult] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    const uploading = useSelector(selectUploading);

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile && (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xlsx'))) {
            setFile(selectedFile);
            setFileError(null);
            setUploadError(null);
        } else {
            setFileError('Invalid file type. Please upload a CSV or Excel (.xlsx) file.');
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const handlePreviewContinue = () => {
        if (!file) {
            setFileError('Please select a file before continuing.');
            return;
        }
        setStep(2);
    };

    const handleUpload = async () => {
        setUploadError(null);
        setUploading?.(true);
        try {
            const result = await dispatch(uploadKPIs({ file, dryRun })).unwrap();
            setUploadResult(result);
            onComplete?.(result);
            setStep(3);
        } catch (err) {
            setUploadError(err?.message || err?.detail || 'Upload failed. Please check your file and try again.');
        } finally {
            setUploading?.(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setUploadResult(null);
        setUploadError(null);
        setFileError(null);
        setStep(1);
    };

    return (
        <div className="bulk-upload-section">
            {/* ── STEP 1: SELECT FILE ── */}
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

                    <div
                        {...getRootProps()}
                        className={`bulk-dropzone ${isDragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <>
                                <FiFile size={32} />
                                <p>{file.name}</p>
                                <span>{(file.size / 1024).toFixed(1)} KB — ready to upload</span>
                            </>
                        ) : (
                            <>
                                <FiUpload size={32} />
                                <p>{isDragActive ? 'Drop file here...' : 'Drag & drop file here or click to browse'}</p>
                                <span>Supports CSV, XLSX (Max 10MB)</span>
                            </>
                        )}
                    </div>

                    {fileError && (
                        <div className="bulk-upload-error">
                            <FiAlertCircle size={14} />
                            {fileError}
                        </div>
                    )}

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
                            onClick={handlePreviewContinue}
                            disabled={!file}
                        >
                            Preview Upload →
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 2: PREVIEW & CONFIRM ── */}
            {step === 2 && file && (
                <>
                    <UploadPreview
                        file={file}
                        onConfirm={handleUpload}
                        onBack={() => setStep(1)}
                        loading={uploading}
                    />
                    {uploadError && (
                        <div className="bulk-upload-error" style={{ marginTop: '1rem' }}>
                            <FiAlertCircle size={14} />
                            {uploadError}
                        </div>
                    )}
                </>
            )}

            {/* ── STEP 3: RESULTS ── */}
            {step === 3 && uploadResult && (
                <UploadResults
                    result={uploadResult}
                    onReset={handleReset}
                    onNewUpload={handleReset}
                />
            )}
        </div>
    );
};

export default BulkKPIUpload;