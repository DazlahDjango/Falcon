// frontend/src/components/reports/presets/PresetSaveModal.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiBookmark, FiSave } from 'react-icons/fi';
import { usePresets } from '../../../hooks/reports';
import './presets.css';

export const PresetSaveModal = ({
    isOpen = false,
    onClose,
    onSuccess,
    reportId = null,
    currentFilters = {},
    initialData = null,
}) => {
    const { createPreset, updatePreset } = usePresets({ autoFetch: false });

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isDefault, setIsDefault] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setDescription(initialData.description || '');
            setIsDefault(initialData.is_default || false);
        } else {
            setName('');
            setDescription('');
            setIsDefault(false);
        }
        setError(null);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter a preset name.');
            return;
        }

        setSubmitting(true);
        setError(null);

        const payload = {
            name: name.trim(),
            description: description.trim(),
            report: reportId,
            filters: currentFilters,
            is_default: isDefault,
        };

        try {
            let res;
            if (initialData?.id) {
                res = await updatePreset(initialData.id, payload);
            } else {
                res = await createPreset(payload);
            }
            onSuccess?.(res);
            onClose?.();
        } catch (err) {
            setError(err.message || 'Failed to save filter preset.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="preset-modal-overlay" onClick={onClose}>
            <div className="preset-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="preset-modal-header">
                    <h3 className="preset-modal-title">
                        <FiBookmark size={18} color="#2563eb" />
                        {initialData?.id ? 'Edit Filter Preset' : 'Save Filter Preset'}
                    </h3>
                    <button className="preset-modal-close" onClick={onClose}>
                        <FiX size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="preset-modal-body">
                        {error && (
                            <div className="alert alert-danger" style={{ padding: '8px 12px', borderRadius: 6, fontSize: '0.85rem' }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="preset_name">Preset Name *</label>
                            <input
                                id="preset_name"
                                type="text"
                                className="form-control"
                                placeholder="e.g. Q3 Operations Focus, High Risk Audits"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="preset_desc">Description</label>
                            <input
                                id="preset_desc"
                                type="text"
                                className="form-control"
                                placeholder="Brief note about these applied filters..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.875rem' }}>
                                <input
                                    type="checkbox"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                />
                                Set as default preset for this report
                            </label>
                        </div>
                    </div>

                    <div className="preset-modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            <FiSave size={14} />
                            {submitting ? 'Saving...' : 'Save Preset'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

PresetSaveModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    onSuccess: PropTypes.func,
    reportId: PropTypes.string,
    currentFilters: PropTypes.object,
    initialData: PropTypes.object,
};

export default PresetSaveModal;
