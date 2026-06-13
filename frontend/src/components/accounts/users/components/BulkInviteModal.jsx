import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    FiUpload, FiDownload, FiFileText, FiX, FiCheckCircle,
    FiAlertCircle, FiUserPlus, FiSend, FiTrash2,
    FiRefreshCw, FiEye, FiEyeOff
} from 'react-icons/fi';
import { useUsers } from '../../../../hooks/accounts/useUsers';
import { showAlert } from '../../../../store/accounts/slice/uiSlice';
import Modal from '../../../common/UI/Modal';
import Spinner from '../../../common/UI/Spinner';

const BulkInviteModal = ({ isOpen, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const { sendInvitation, invitationLoading } = useUsers();

    const [step, setStep] = useState(1);
    const [csvData, setCsvData] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [results, setResults] = useState({ success: [], failed: [] });

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            dispatch(showAlert({ type: 'error', message: 'Please upload a CSV file' }));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split('\n').filter(row => row.trim());
            const headers = rows[0].split(',').map(h => h.trim().toLowerCase());

            // Validate headers
            const requiredHeaders = ['email', 'role'];
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

            if (missingHeaders.length > 0) {
                dispatch(showAlert({ type: 'error', message: `Missing required columns: ${missingHeaders.join(', ')}` }));
                return;
            }

            const data = [];
            const validationErrors = [];

            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(',').map(v => v.trim());
                const user = {};

                headers.forEach((header, index) => {
                    user[header] = values[index] || '';
                });

                // Validate email
                if (!user.email || !/\S+@\S+\.\S+/.test(user.email)) {
                    validationErrors.push({ row: i + 1, email: user.email, error: 'Invalid email format' });
                    continue;
                }

                // Validate role
                const validRoles = ['staff', 'supervisor', 'executive', 'dashboard_champion', 'read_only'];
                if (!user.role || !validRoles.includes(user.role)) {
                    validationErrors.push({ row: i + 1, email: user.email, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
                    continue;
                }

                data.push(user);
            }

            setCsvData(data);
            setPreviewData(data.slice(0, 10));
            setErrors(validationErrors);

            if (data.length === 0) {
                dispatch(showAlert({ type: 'error', message: 'No valid records found in CSV' }));
            } else {
                setStep(2);
            }
        };
        reader.readAsText(file);
    }, [dispatch]);

    const handleProcessInvitations = async () => {
        setIsProcessing(true);
        const successList = [];
        const failedList = [];

        for (let i = 0; i < csvData.length; i++) {
            const user = csvData[i];
            setProgress({ current: i + 1, total: csvData.length });

            try {
                await sendInvitation({
                    email: user.email,
                    role: user.role,
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    message: user.message || `You've been invited to join as ${user.role}`
                });
                successList.push(user);
            } catch (error) {
                failedList.push({ ...user, error: error.message });
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setResults({ success: successList, failed: failedList });
        setStep(3);
        setIsProcessing(false);

        if (successList.length > 0) {
            dispatch(showAlert({ type: 'success', message: `Successfully invited ${successList.length} users` }));
            onSuccess?.();
        }
    };

    const downloadTemplate = () => {
        const headers = ['email', 'role', 'first_name', 'last_name', 'message'];
        const sampleRows = [
            ['john.doe@example.com', 'staff', 'John', 'Doe', 'Welcome to the team!'],
            ['jane.smith@example.com', 'supervisor', 'Jane', 'Smith', ''],
            ['bob.wilson@example.com', 'executive', 'Bob', 'Wilson', 'Executive role invitation'],
        ];

        const csvContent = [headers.join(','), ...sampleRows.map(row => row.join(','))].join('\n');
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk_invite_template.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const resetAndClose = () => {
        setStep(1);
        setCsvData(null);
        setPreviewData([]);
        setErrors([]);
        setResults({ success: [], failed: [] });
        setProgress({ current: 0, total: 0 });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={resetAndClose} title="Bulk Invite Users" size="lg">
            <div className="bulk-invite-modal">
                {/* Step 1: Upload CSV */}
                {step === 1 && (
                    <div className="step-content">
                        <div className="step-header">
                            <div className="step-number">1</div>
                            <div>
                                <h3>Upload CSV File</h3>
                                <p>Upload a CSV file with user details for bulk invitation</p>
                            </div>
                        </div>

                        <div className="upload-area" onClick={() => document.getElementById('csv-upload').click()}>
                            <FiUpload size={32} />
                            <strong>Click to upload CSV file</strong>
                            <span>or drag and drop</span>
                            <small>CSV format with columns: email, role, first_name, last_name, message</small>
                        </div>
                        <input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                        />

                        <button className="btn-template" onClick={downloadTemplate}>
                            <FiDownload size={14} />
                            Download Template
                        </button>

                        <div className="step-note">
                            <FiAlertCircle size={14} />
                            <span>Required columns: email, role. Optional: first_name, last_name, message</span>
                        </div>
                    </div>
                )}

                {/* Step 2: Preview and Confirm */}
                {step === 2 && (
                    <div className="step-content">
                        <div className="step-header">
                            <div className="step-number">2</div>
                            <div>
                                <h3>Preview Invitations</h3>
                                <p>Review the data before sending invitations</p>
                            </div>
                        </div>

                        {errors.length > 0 && (
                            <div className="validation-errors">
                                <strong><FiAlertCircle /> {errors.length} validation errors found</strong>
                                <div className="errors-list">
                                    {errors.slice(0, 5).map((err, i) => (
                                        <div key={i} className="error-item">
                                            Row {err.row}: {err.email} - {err.error}
                                        </div>
                                    ))}
                                    {errors.length > 5 && <div>... and {errors.length - 5} more errors</div>}
                                </div>
                            </div>
                        )}

                        <div className="preview-table-container">
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>First Name</th>
                                        <th>Last Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((user, index) => (
                                        <tr key={index}>
                                            <td>{user.email}</td>
                                            <td><span className="role-badge">{user.role}</span></td>
                                            <td>{user.first_name || '—'}</td>
                                            <td>{user.last_name || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {csvData.length > 10 && (
                                <div className="preview-note">
                                    + {csvData.length - 10} more users
                                </div>
                            )}
                        </div>

                        <div className="step-actions">
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>
                                Back
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleProcessInvitations}
                                disabled={csvData.length === 0}
                            >
                                <FiSend size={16} />
                                Send {csvData.length} Invitations
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Results */}
                {step === 3 && (
                    <div className="step-content">
                        <div className="step-header">
                            <div className="step-number">3</div>
                            <div>
                                <h3>Invitation Results</h3>
                                <p>Summary of sent invitations</p>
                            </div>
                        </div>

                        <div className="results-summary">
                            <div className="result-card success">
                                <FiCheckCircle size={24} />
                                <div className="result-count">{results.success.length}</div>
                                <div className="result-label">Successful</div>
                            </div>
                            <div className="result-card failed">
                                <FiAlertCircle size={24} />
                                <div className="result-count">{results.failed.length}</div>
                                <div className="result-label">Failed</div>
                            </div>
                            <div className="result-card total">
                                <FiUserPlus size={24} />
                                <div className="result-count">{results.success.length + results.failed.length}</div>
                                <div className="result-label">Total Processed</div>
                            </div>
                        </div>

                        {results.failed.length > 0 && (
                            <div className="failed-list">
                                <strong>Failed Invitations:</strong>
                                {results.failed.map((item, i) => (
                                    <div key={i} className="failed-item">
                                        <span>{item.email}</span>
                                        <span className="error-msg">{item.error}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="step-actions">
                            <button className="btn btn-primary" onClick={resetAndClose}>
                                Done
                            </button>
                            <button className="btn btn-secondary" onClick={() => { setStep(1); setCsvData(null); }}>
                                Send More
                            </button>
                        </div>
                    </div>
                )}

                {/* Processing Overlay */}
                {isProcessing && (
                    <div className="processing-overlay">
                        <div className="processing-content">
                            <Spinner size="lg" />
                            <h4>Sending Invitations...</h4>
                            <div className="processing-progress">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                                    />
                                </div>
                                <p>{progress.current} of {progress.total} sent</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default BulkInviteModal;