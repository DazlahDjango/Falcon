import React, { useState } from 'react';
import { FiX, FiAlertCircle, FiSend, FiUpload } from 'react-icons/fi';

const EscalationFormModal = ({ validation, onClose, onSubmit, loading }) => {
    const [reason, setReason] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [evidenceFile, setEvidenceFile] = useState(null);

    if (!validation) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            alert('Please provide a reason for escalating this rejection dispute.');
            return;
        }

        const formData = new FormData();
        formData.append('validation_id', validation.id);
        formData.append('reason', reason);
        formData.append('notes', additionalNotes);
        if (evidenceFile) {
            formData.append('evidence', evidenceFile);
        }

        onSubmit && onSubmit(formData);
    };

    return (
        <div className="escalation-modal-overlay">
            <div className="escalation-modal-container">
                <div className="escalation-modal-header">
                    <div className="title-group">
                        <FiAlertCircle size={20} className="icon-warning" />
                        <h3>Submit Dispute Escalation</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="escalation-modal-body">
                        <div className="dispute-info-card">
                            <p><strong>KPI:</strong> {validation.kpi_name || validation.kpi_code}</p>
                            <p><strong>Period:</strong> {validation.period || 'Current Period'}</p>
                            <p><strong>Submitted Actual:</strong> {validation.actual_value}</p>
                            <p className="rejection-comment">
                                <strong>Supervisor Rejection Note:</strong> "{validation.comment || 'Submission rejected without comment.'}"
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="required">Reason for Escalation to Client Admin / CFO</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                placeholder="Explain why the supervisor rejection should be reviewed or overridden..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Additional Context / Proof Details</label>
                            <textarea
                                className="form-control"
                                rows={2}
                                placeholder="Provide supporting context, contract IDs, or customer sign-off details..."
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Attach Supplemental Evidence (PDF / Images)</label>
                            <div className="file-upload-input">
                                <input
                                    type="file"
                                    id="escalation-evidence"
                                    accept=".pdf,.png,.jpg,.jpeg,.xlsx"
                                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                                />
                                <label htmlFor="escalation-evidence" className="upload-label">
                                    <FiUpload size={16} />
                                    <span>{evidenceFile ? evidenceFile.name : 'Choose signed invoice, PO, or contract proof...'}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="escalation-modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            <FiSend size={14} />
                            {loading ? 'Submitting Escalation...' : 'Submit to CFO Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EscalationFormModal;
