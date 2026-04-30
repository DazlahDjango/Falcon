import React, { useState, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';

const BulkUploadModal = ({ isOpen, onClose, onUpload, templateUrl, isUploading = false, className = '' }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  if (!isOpen) return null;
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      setFile(droppedFile);
      setError('');
      // Simulate preview
      setPreview({ rows: 10, columns: ['code', 'name', 'parent_code'] });
    } else {
      setError('Please upload a CSV or Excel file');
    }
  }, []);
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setPreview({ rows: 10, columns: ['code', 'name', 'parent_code'] });
    }
  };
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    await onUpload(file);
  };
  const downloadTemplate = () => {
    if (templateUrl) {
      window.open(templateUrl, '_blank');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-container modal-container-lg ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-blue-500" />
            <h3 className="text-lg font-semibold">Bulk Upload</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {templateUrl && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <FileSpreadsheet size={16} />
                <span>Download template to get started</span>
              </div>
              <button onClick={downloadTemplate} className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                <Download size={14} /> Template
              </button>
            </div>
          )}
          <div
            className={`bulk-upload-area ${dragActive ? 'bulk-upload-area-dragging' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input').click()}
          >
            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Drag & drop your file here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse</p>
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          {error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          {file && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle size={14} />
              <span>Selected: {file.name}</span>
            </div>
          )}
          {preview && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <div className="border rounded-lg overflow-hidden">
                <table className="preview-table">
                  <thead className="bg-gray-50">
                    <tr>
                      {preview.columns.map(col => <th key={col}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {Array(preview.rows).fill().map((_, i) => (
                      <tr key={i}>
                        {preview.columns.map(col => <td key={col}>Sample {col}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-2 text-center text-xs text-gray-400">
                  Showing {preview.rows} of {preview.rows} rows
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Upload size={14} />
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default BulkUploadModal;