import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useMFA } from '../../../hooks/accounts/useMfa';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';
import { FiCopy, FiDownload, FiRefreshCw, FiCheck } from 'react-icons/fi';

const MFABackupCodes = ({ onGenerate }) => {
    const dispatch = useDispatch();
    const {
        backupCodes,
        backupCodesRemaining,
        backupCodesLoading,
        generateNewBackupCodes,
        clearGeneratedBackupCodes,
        loadMfaStatus
    } = useMFA();

    const [showGeneratedCodes, setShowGeneratedCodes] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);

    useEffect(() => {
        loadMfaStatus();
    }, [loadMfaStatus]);

    const handleGenerateCodes = async () => {
        try {
            const result = await generateNewBackupCodes(10);
            setShowGeneratedCodes(true);
            setShowConfirmRegenerate(false);
            dispatch(showAlert({ type: 'success', message: 'New backup codes generated!' }));
            onGenerate?.();
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: 'Failed to generate backup codes' }));
        }
    };

    const copyToClipboard = async () => {
        const codesText = backupCodes.join('\n');
        await navigator.clipboard.writeText(codesText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        dispatch(showAlert({ type: 'success', message: 'Backup codes copied!' }));
    };

    const downloadCodes = () => {
        const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `falcon-backup-codes-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="mfa-backup-codes">
            <div className="backup-header">
                <h3>Backup Codes</h3>
                <p>Use these codes to access your account if you lose your authenticator device</p>
            </div>

            <div className="backup-stats">
                <div className="stat-card">
                    <div className="stat-value">{backupCodesRemaining}</div>
                    <div className="stat-label">Remaining Codes</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{10 - backupCodesRemaining}</div>
                    <div className="stat-label">Used Codes</div>
                </div>
            </div>

            {showGeneratedCodes && backupCodes.length > 0 ? (
                <>
                    <div className="backup-codes-container">
                        <div className="warning-banner">
                            <strong>⚠️ Important:</strong>
                            <ul>
                                <li>Save these codes in a secure location</li>
                                <li>Each code can only be used once</li>
                                <li>You will not see these codes again</li>
                            </ul>
                        </div>

                        <div className="backup-codes-grid">
                            {backupCodes.map((code, index) => (
                                <div key={index} className="backup-code-item">
                                    <code>{code}</code>
                                </div>
                            ))}
                        </div>

                        <div className="backup-actions">
                            <button className="btn btn-secondary" onClick={copyToClipboard}>
                                {copied ? <FiCheck /> : <FiCopy />} Copy Codes
                            </button>
                            <button className="btn btn-secondary" onClick={downloadCodes}>
                                <FiDownload /> Download
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    clearGeneratedBackupCodes();
                                    setShowGeneratedCodes(false);
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div className="regenerate-section">
                        <p>Need new codes? Generate a fresh set (old codes will be invalidated)</p>
                        <button
                            className="btn btn-outline"
                            onClick={() => setShowConfirmRegenerate(true)}
                        >
                            <FiRefreshCw /> Regenerate Codes
                        </button>
                    </div>
                </>
            ) : (
                <div className="backup-empty">
                    <div className="empty-icon">🔑</div>
                    <h4>No backup codes generated yet</h4>
                    <p>Generate backup codes to have a recovery option for your account</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowConfirmRegenerate(true)}
                        disabled={backupCodesLoading}
                    >
                        {backupCodesLoading ? <Spinner size="sm" /> : 'Generate Backup Codes'}
                    </button>
                </div>
            )}

            {/* Regenerate Confirmation Modal */}
            {showConfirmRegenerate && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Generate New Backup Codes?</h3>
                        <p>Generating new backup codes will invalidate any previously generated codes.</p>
                        <p className="warning-text">
                            Make sure to save the new codes in a secure location.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowConfirmRegenerate(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleGenerateCodes}>
                                Generate New Codes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MFABackupCodes;