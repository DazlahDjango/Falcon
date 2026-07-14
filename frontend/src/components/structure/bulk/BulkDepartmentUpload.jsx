import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUpload,
  FiFile,
  FiCheck,
  FiAlertCircle,
  FiDownload,
  FiTrash2,
  FiRefreshCw,
  FiPlus,
} from 'react-icons/fi';
import { useDepartments } from '../../../hooks/structure';
import { useBulkOperations } from '../../../hooks/structure';
import { StructureLoading, StructureStatusBadge } from '../common';
import { STRUCTURE_ROUTES } from '../../../config/constants/structureRouteConstants';
import './bulk.css';

export const BulkDepartmentUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [uploadResults, setUploadResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const { bulkDepartments, isCreating } = useBulkOperations();
  const { fetchAll: refreshDepartments } = useDepartments({ autoFetch: false });

  const handleBack = useCallback(() => {
    navigate(STRUCTURE_ROUTES.DEPARTMENTS);
  }, [navigate]);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let data;
        if (selectedFile.name.endsWith('.json')) {
          data = JSON.parse(content);
          const departments = data.departments || data;
          setPreviewData(Array.isArray(departments) ? departments : [departments]);
        } else {
          setError('Please upload a JSON file');
          return;
        }
        setFile(selectedFile);
        setError(null);
      } catch (err) {
        setError('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsText(selectedFile);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileSelect(event);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setPreviewData([]);
    setUploadResults(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!previewData.length) {
      setError('No data to upload');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(10);

    try {
      const response = await bulkDepartments({
        departments: previewData,
        action: 'create',
      });

      setProgress(100);
      setUploadResults(response.data || response);

      if ((response.data?.results?.failed_count || 0) === 0) {
        await refreshDepartments({ page: 1, page_size: 20 });
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1500);
    }
  }, [previewData, bulkDepartments, refreshDepartments]);

  const handleDownloadTemplate = useCallback(() => {
    const template = {
      departments: [
        {
          code: 'DEPT-001',
          name: 'Sample Department',
          description: 'Sample department description',
          parent_id: '',
          headcount_limit: 50,
          sensitivity_level: 'internal',
          is_active: true,
        },
        {
          code: 'DEPT-002',
          name: 'Another Department',
          description: 'Another sample department',
          parent_id: '',
          headcount_limit: 30,
          sensitivity_level: 'confidential',
          is_active: true,
        },
      ],
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'departments_template.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }, []);

  const renderPreview = () => {
    if (!previewData.length) return null;

    const headers = Object.keys(previewData[0] || {});

    return (
      <div className="bulk-preview">
        <div className="preview-header">
          <h3>Preview ({previewData.length} departments)</h3>
          <div className="preview-actions">
            <button onClick={handleRemoveFile} className="btn btn-secondary">
              <FiTrash2 size={16} />
              Clear
            </button>
            <button onClick={handleUpload} className="btn btn-primary" disabled={isProcessing}>
              <FiUpload size={16} />
              Upload All
            </button>
          </div>
        </div>
        <div className="preview-table-wrapper">
          <table className="preview-table">
            <thead>
              <tr>
                {headers.slice(0, 6).map((header) => (
                  <th key={header}>{header}</th>
                ))}
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {previewData.slice(0, 10).map((item, index) => (
                <tr key={index}>
                  {headers.slice(0, 6).map((header) => (
                    <td key={header}>{String(item[header] || '-')}</td>
                  ))}
                  <td>
                    <StructureStatusBadge
                      status={item.code && item.name ? 'active' : 'inactive'}
                      customLabel={item.code && item.name ? 'Valid' : 'Invalid'}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {previewData.length > 10 && (
            <div className="preview-more">
              + {previewData.length - 10} more items
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!uploadResults) return null;

    const results = uploadResults.results || uploadResults;
    const created = results.created_count || results.created?.length || 0;
    const updated = results.updated_count || results.updated?.length || 0;
    const failed = results.failed_count || results.failed?.length || 0;
    const total = results.total || previewData.length;

    return (
      <div className="bulk-results">
        <div className="results-header">
          <h3>Upload Results</h3>
          <StructureStatusBadge
            status={failed === 0 ? 'active' : 'inactive'}
            customLabel={failed === 0 ? 'Complete' : 'Partial'}
            size="lg"
          />
        </div>
        <div className="results-stats">
          <div className="result-stat success">
            <span className="stat-value">{created}</span>
            <span className="stat-label">Created</span>
          </div>
          <div className="result-stat info">
            <span className="stat-value">{updated}</span>
            <span className="stat-label">Updated</span>
          </div>
          <div className="result-stat danger">
            <span className="stat-value">{failed}</span>
            <span className="stat-label">Failed</span>
          </div>
          <div className="result-stat total">
            <span className="stat-value">{total}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        {failed > 0 && results.failed && (
          <div className="results-errors">
            <h4>Errors</h4>
            <ul>
              {results.failed.slice(0, 5).map((item, index) => (
                <li key={index}>
                  <FiAlertCircle size={14} />
                  <span>{item.error || item.errors || 'Unknown error'}</span>
                </li>
              ))}
              {results.failed.length > 5 && (
                <li className="more-errors">+ {results.failed.length - 5} more errors</li>
              )}
            </ul>
          </div>
        )}
        <button onClick={() => setUploadResults(null)} className="btn btn-secondary">
          Clear Results
        </button>
      </div>
    );
  };

  if (isProcessing || isCreating) {
    return (
      <div className="bulk-processing">
        <StructureLoading text="Processing departments..." />
        {progress > 0 && (
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
            <span className="progress-text">{progress}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bulk-container">
      <div className="bulk-header">
        <button onClick={handleBack} className="back-btn">
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1>Bulk Department Upload</h1>
      </div>

      <div className="bulk-body">
        <div className="bulk-info-card">
          <FiFile size={24} />
          <div>
            <h3>Upload Multiple Departments</h3>
            <p>Upload a JSON file containing multiple departments to create them in bulk.</p>
          </div>
        </div>

        {!file ? (
          <div
            className="bulk-drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <FiUpload size={40} />
            <h3>Drop your JSON file here</h3>
            <p>or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <div className="drop-zone-actions">
              <button onClick={handleDownloadTemplate} className="btn btn-secondary">
                <FiDownload size={16} />
                Download Template
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="bulk-file-info">
              <div className="file-details">
                <FiFile size={20} />
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <StructureStatusBadge
                  status={previewData.length > 0 ? 'active' : 'inactive'}
                  customLabel={`${previewData.length} records`}
                  size="sm"
                />
              </div>
              <button onClick={handleRemoveFile} className="btn btn-secondary">
                <FiTrash2 size={16} />
                Remove
              </button>
            </div>

            {error && (
              <div className="bulk-error">
                <FiAlertCircle size={16} />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="btn btn-secondary">
                  Dismiss
                </button>
              </div>
            )}

            {renderPreview()}
            {renderResults()}
          </>
        )}
      </div>
    </div>
  );
};

export default BulkDepartmentUpload;
