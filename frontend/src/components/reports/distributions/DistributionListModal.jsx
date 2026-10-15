// frontend/src/components/reports/distributions/DistributionListModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiPlus, FiTrash2, FiUsers, FiSave } from 'react-icons/fi';
import { useDistributions } from '../../../hooks/reports';
import './distributions.css';

export const DistributionListModal = ({
    isOpen = false,
    onClose,
    onSuccess,
    initialData = null,
}) => {
    const { createDistribution, updateDistribution } = useDistributions({ autoFetch: false });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        recipients: [],
        is_active: true,
    });
    const [emailInput, setEmailInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                recipients: initialData.recipients || [],
                is_active: initialData.is_active !== undefined ? initialData.is_active : true,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                recipients: [],
                is_active: true,
            });
        }
        setError(null);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleAddRecipient = () => {
        const trimmed = emailInput.trim();
        if (trimmed && !formData.recipients.includes(trimmed)) {
            setFormData((prev) => ({
                ...prev,
                recipients: [...prev.recipients, trimmed],
            }));
            setEmailInput('');
        }
    };

    const handleRemoveRecipient = (email) => {
        setFormData((prev) => ({
            ...prev,
            recipients: prev.recipients.filter((r) => r !== email),
        }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddRecipient();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Please enter a distribution list name.');
            return;
        }
        if (formData.recipients.length === 0) {
            setError('Please add at least one recipient email.');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            let res;
            if (initialData?.id) {
                res = await updateDistribution(initialData.id, formData);
            } else {
                res = await createDistribution(formData);
            }
            onSuccess?.(res);
            onClose?.();
        } catch (err) {
            setError(err.message || 'Failed to save distribution list.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="distribution-modal-overlay" onClick={onClose}>
            <div className="distribution-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="distribution-modal-header">
                    <h3 className="distribution-modal-title">
                        <FiUsers size={20} color="#2563eb" />
                        {initialData?.id ? 'Edit Distribution List' : 'New Distribution List'}
                    </h3>
                    <button className="distribution-modal-close" onClick={onClose}>
                        <FiX size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="distribution-modal-body">
                        {error && (
                            <div className="alert alert-danger" style={{ padding: '8px 12px', borderRadius: 6, fontSize: '0.85rem' }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="dist_name">List Name *</label>
                            <input
                                id="dist_name"
                                type="text"
                                className="form-control"
                                placeholder="e.g. Executive Board, Finance Leads"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="dist_desc">Description</label>
                            <textarea
                                id="dist_desc"
                                className="form-control"
                                placeholder="Describe who is in this recipient group..."
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                rows={2}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Add Recipients *</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="stakeholder@company.com"
                                    value={emailInput}
                                    onChange={(e) => setEmailInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleAddRecipient}
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    <FiPlus size={14} /> Add
                                </button>
                            </div>

                            <div className="distribution-recipients-tags" style={{ marginTop: 10 }}>
                                {formData.recipients.map((email) => (
                                    <span key={email} className="distribution-recipient-chip">
                                        {email}
                                        <button
                                            type="button"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 4 }}
                                            onClick={() => handleRemoveRecipient(email)}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="form-group checkbox-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                                />
                                Active for automated schedules
                            </label>
                        </div>
                    </div>

                    <div className="distribution-modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            <FiSave size={16} />
                            {submitting ? 'Saving...' : 'Save Distribution List'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

DistributionListModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onSuccess: PropTypes.func,
    initialData: PropTypes.object,
};

export default DistributionListModal;
