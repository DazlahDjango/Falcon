import React, { useState, useEffect } from 'react';
import {
  FiKey,
  FiRefreshCw,
  FiCopy,
  FiDownload,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
} from 'react-icons/fi';
import { useMFA } from '../../../hooks/accounts/useMFA';

export const BackupCodesDisplay = () => {
  const {
    getBackupStatus,
    generateBackupCodes,
    backupCodesStatus,
    backupCodes,
    isLoading,
    error,
    clearMfaError,
  } = useMFA();

  
  const [codes, setCodes] = useState([]);
  const [remaining, setRemaining] = useState(0);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    clearMfaError();
    const result = await getBackupStatus();
    if (result.success !== false) {
      setRemaining(result.remaining || result.data?.remaining || 0);
    }
  };

  const handleGenerate = async () => {
    setRegenerating(true);
    setShowRegenerateConfirm(false);
    try {
      const result = await generateBackupCodes();
      if (result.success !== false) {
        setCodes(result.codes || result.data?.codes || []);
        setRemaining(result.codes?.length || result.data?.codes?.length || 0);
      }
    } catch (err) {
      console.error('Failed to generate backup codes:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyCodes = () => {
    const codesText = codes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadCodes = () => {
    const blob = new Blob(
      [
        `Falcon PMS Backup Codes\n\n` +
        `Generated: ${new Date().toISOString()}\n\n` +
        codes.join('\n') +
        `\n\nKeep these codes safe. Each code can only be used once.`,
      ],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `falcon-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasCodes = codes.length > 0 || remaining > 0;

  if (error) {
    return (
      <div className="backup-codes-error">
        <FiAlertTriangle className="error-icon" />
        <span>{error}</span>
        <button className="btn-secondary-sm" onClick={loadStatus}>
          <FiRefreshCw /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="backup-codes-container">
      <div className="backup-codes-header">
        <div className="backup-codes-title">
          <FiKey className="title-icon" />
          <h3>Backup Codes</h3>
        </div>
        <div className="backup-codes-actions">
          <button
            className="btn-secondary-sm"
            onClick={loadStatus}
            disabled={isLoading}
          >
            <FiRefreshCw className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
          <button
            className="btn-primary-sm"
            onClick={() => setShowRegenerateConfirm(true)}
            disabled={isLoading || regenerating}
          >
            <FiRefreshCw className={regenerating ? 'spinning' : ''} />
            Generate New
          </button>
        </div>
      </div>

      <div className="backup-codes-status">
        <div className="status-item">
          <span className="status-label">Remaining Codes</span>
          <span className={`status-value ${remaining <= 3 ? 'warning' : ''}`}>
            {remaining}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Status</span>
          <span className={`status-value ${remaining > 0 ? 'active' : 'empty'}`}>
            {remaining > 0 ? (
              <>
                <FiCheckCircle /> Active
              </>
            ) : (
              <>
                <FiAlertTriangle /> No codes remaining
              </>
            )}
          </span>
        </div>
      </div>

      {remaining <= 3 && remaining > 0 && (
        <div className="backup-codes-warning-banner">
          <FiAlertTriangle />
          <span>You have {remaining} backup code{remaining > 1 ? 's' : ''} remaining. Generate new codes soon.</span>
        </div>
      )}

      {codes.length > 0 && (
        <>
          <div className="backup-codes-grid">
            {codes.map((code, index) => (
              <div key={index} className="backup-code-item">
                <span className="backup-code-number">{index + 1}.</span>
                <code className="backup-code-value">{code}</code>
              </div>
            ))}
          </div>

          <div className="backup-codes-actions-row">
            <button className="btn-secondary-sm" onClick={handleCopyCodes}>
              <FiCopy /> {copied ? 'Copied!' : 'Copy Codes'}
            </button>
            <button className="btn-secondary-sm" onClick={handleDownloadCodes}>
              <FiDownload /> Download
            </button>
          </div>

          <div className="backup-codes-info">
            <FiInfo />
            <span>These codes will only be shown once. Save them in a secure place.</span>
          </div>
        </>
      )}

      {remaining === 0 && codes.length === 0 && (
        <div className="backup-codes-empty">
          <FiKey className="empty-icon" />
          <p>No backup codes available</p>
          <p className="empty-hint">Generate backup codes to use when you don't have access to your authenticator</p>
          <button
            className="btn-primary"
            onClick={() => setShowRegenerateConfirm(true)}
            disabled={isLoading || regenerating}
          >
            Generate Backup Codes
          </button>
        </div>
      )}

      {showRegenerateConfirm && (
        <div className="modal-overlay" onClick={() => setShowRegenerateConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Generate New Backup Codes</h3>
              <button className="modal-close" onClick={() => setShowRegenerateConfirm(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>Generating new backup codes will invalidate any existing codes.</p>
              <p className="text-muted">Are you sure you want to continue?</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowRegenerateConfirm(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleGenerate} disabled={isLoading || regenerating}>
                {regenerating ? 'Generating...' : 'Yes, Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupCodesDisplay;
