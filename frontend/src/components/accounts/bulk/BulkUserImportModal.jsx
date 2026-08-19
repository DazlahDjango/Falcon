import React, { useState, useRef } from 'react';
import {
  FiX,
  FiUploadCloud,
  FiFileText,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiUserCheck,
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useUsers } from '../../../hooks/accounts/useUsers';

export const BulkUserImportModal = ({ isOpen, onClose, onSuccess }) => {
  const { importUsers, loadUsers } = useUsers();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setErrorMsg('Please select a valid .csv file');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      setImportResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setErrorMsg('Please select a valid .csv file');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      setImportResult(null);
    }
  };

  const handleDownloadSample = () => {
    const sampleHeaders = 'email,username,first_name,last_name,role,employee_id,department,title\n';
    const sampleRow1 = 'john.doe@company.com,jdoe,John,Doe,staff,EMP001,Engineering,Software Engineer\n';
    const sampleRow2 = 'jane.smith@company.com,jsmith,Jane,Smith,supervisor,EMP002,Operations,Operations Manager\n';
    
    const blob = new Blob([sampleHeaders + sampleRow1 + sampleRow2], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_users_import_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Sample CSV template downloaded!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a CSV file to upload');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const result = await importUsers(formData);
      setImportResult(result);
      if (result.success_count > 0) {
        toast.success(`Successfully imported ${result.success_count} user(s)!`);
        if (onSuccess) onSuccess(result);
        if (loadUsers) loadUsers();
      } else if (result.errors && result.errors.length > 0) {
        toast.error('Import failed with errors');
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Failed to import users';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content bulk-import-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <FiUserCheck className="text-primary-600 text-xl" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Bulk Import Users</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal-body p-6">
          {/* Sample template download header */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Need a starting template?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Download formatted CSV template with required headers.</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FiDownload /> Template
            </button>
          </div>

          {errorMsg && (
            <div className="modal-alert error mb-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
              <FiAlertCircle className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Import Result Summary */}
          {importResult && (
            <div className="mb-5 space-y-3">
              {importResult.success_count > 0 && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-start gap-3">
                  <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 text-lg mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      Successfully imported {importResult.success_count} user(s)!
                    </h4>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Account credentials & welcome emails have been dispatched to MailHog.
                    </p>
                  </div>
                </div>
              )}

              {importResult.errors && importResult.errors.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm mb-2">
                    <FiAlertCircle />
                    <span>{importResult.errors.length} Row Issue(s) Encountered:</span>
                  </div>
                  <ul className="text-xs text-amber-700 dark:text-amber-400 max-h-32 overflow-y-auto space-y-1 pl-4 list-disc">
                    {importResult.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* File Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv"
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <FiFileText className="text-primary-600 text-3xl mb-2" />
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="mt-3 text-xs text-red-600 hover:text-red-700 font-medium underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FiUploadCloud className="text-slate-400 dark:text-slate-500 text-4xl mb-2" />
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">CSV files only (Max 5MB)</p>
                </div>
              )}
            </div>

            <div className="modal-actions mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                onClick={onClose}
              >
                {importResult ? 'Close' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="px-5 py-2 text-sm font-semibold bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2 transition-all shadow-sm"
              >
                {isUploading ? (
                  <>
                    <FiRefreshCw className="animate-spin text-base" />
                    Processing Import...
                  </>
                ) : (
                  <>
                    <FiUploadCloud className="text-base" />
                    Upload & Import
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkUserImportModal;
