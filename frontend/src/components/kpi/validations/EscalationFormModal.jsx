import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle, FiSend } from 'react-icons/fi';
import useEscalations from '../../../hooks/kpi/useEscalations';

const EscalationFormModal = ({ validation, actual, onClose, onSubmit, loading: propLoading }) => {
    const item = actual || validation;
    const [reason, setReason] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [escalatedTo, setEscalatedTo] = useState('');

    const { escalationTargets, loadEscalationTargets, escalate, loading: hookLoading } = useEscalations();
    const loading = propLoading || hookLoading;

    useEffect(() => {
        loadEscalationTargets();
    }, [loadEscalationTargets]);

    useEffect(() => {
        if (escalationTargets && escalationTargets.length > 0 && !escalatedTo) {
            setEscalatedTo(escalationTargets[0].id);
        }
    }, [escalationTargets, escalatedTo]);

    if (!item) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            alert('Please provide a reason for escalating this performance entry.');
            return;
        }
        if (!escalatedTo) {
            alert('Please select a manager/supervisor to escalate this entry to.');
            return;
        }

        const payload = {
            actual_id: item.actual_id || item.id,
            escalated_to_id: escalatedTo,
            reason: reason,
            notes: additionalNotes,
        };

        onSubmit && onSubmit(payload);
    };

    return (
        <div className="escalation-modal-overlay">
            <div className="escalation-modal-container">
                <div className="escalation-modal-header">
                    <div className="title-group">
                        <FiAlertCircle size={20} className="icon-warning" style={{ color: '#8b5cf6' }} />
                        <h3>Submit KPI Result Escalation</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="escalation-modal-body">
                        <div className="dispute-info-card" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                            <p style={{ margin: '0 0 0.35rem 0' }}><strong>KPI:</strong> {item.kpi_name || item.kpi?.name || item.kpi_code}</p>
                            <p style={{ margin: '0 0 0.35rem 0' }}><strong>Period:</strong> {item.period || `${item.year || ''} - Month ${item.month || ''}`}</p>
                            <p style={{ margin: '0 0 0.35rem 0' }}><strong>Submitted Actual:</strong> {item.actual_value}</p>
                            {(item.comment || item.notes) && (
                                <p className="rejection-comment" style={{ margin: '0.35rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                                    <strong>Context / Note:</strong> "{item.comment || item.notes}"
                                </p>
                            )}
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                            <label className="required" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                                Escalate To (Reporting Hierarchy Leader / Supervisor) <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select
                                className="form-control"
                                value={escalatedTo}
                                onChange={(e) => setEscalatedTo(e.target.value)}
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                required
                            >
                                {escalationTargets.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} ({t.role || 'Supervisor'}) {t.is_direct_manager ? '— Direct Manager' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                            <label className="required" style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                                Reason for Escalation <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <textarea
                                className="form-control"
                                rows={3}
                                placeholder="Explain why this entry or rejection needs review by higher management..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>Additional Remarks / Details (Optional)</label>
                            <textarea
                                className="form-control"
                                rows={2}
                                placeholder="Provide supporting context, contract details, or justification..."
                                value={additionalNotes}
                                onChange={(e) => setAdditionalNotes(e.target.value)}
                                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                    </div>

                    <div className="escalation-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '0.6rem 1.1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f1f5f9', cursor: 'pointer' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading || !escalatedTo} style={{ padding: '0.6rem 1.1rem', borderRadius: '6px', background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <FiSend size={14} />
                            {loading ? 'Submitting Escalation...' : 'Submit Escalation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EscalationFormModal;
