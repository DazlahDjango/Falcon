// frontend/src/components/reports/filters/FilterEdit.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { useFilter, useFilters } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import './filters.css';

export const FilterEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        filter,
        loading,
        error,
        fetchOne,
        update,
        clearErrors,
    } = useFilter(id, { autoFetch: true });

    const { clearErrors: clearGlobalErrors } = useFilters({ autoFetch: false });

    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        if (filter) {
            setFormData({
                name: filter.name || '',
                display_label: filter.display_label || '',
                placeholder: filter.placeholder || '',
                help_text: filter.help_text || '',
                required: filter.required || false,
                multiple: filter.multiple || false,
                options: filter.options || [],
                default_values: filter.default_values || [],
                validation: filter.validation || {},
                dependencies: filter.dependencies || [],
                is_global: filter.is_global || false,
                config: filter.config || {},
                values: filter.values || {},
            });
        }
    }, [filter]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData((prev) => ({ ...prev, options: newOptions }));
    };

    const handleAddOption = () => {
        setFormData((prev) => ({ ...prev, options: [...prev.options, ''] }));
    };

    const handleRemoveOption = (index) => {
        setFormData((prev) => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index),
        }));
    };

    const handleDefaultValueChange = (index, value) => {
        const newDefaults = [...formData.default_values];
        newDefaults[index] = value;
        setFormData((prev) => ({ ...prev, default_values: newDefaults }));
    };

    const handleAddDefaultValue = () => {
        setFormData((prev) => ({ ...prev, default_values: [...prev.default_values, ''] }));
    };

    const handleRemoveDefaultValue = (index) => {
        setFormData((prev) => ({
            ...prev,
            default_values: prev.default_values.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData) return;
        setIsSubmitting(true);
        try {
            await update(id, formData);
            navigate('/reports/filters');
        } catch (err) {
            console.error('Failed to update filter:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (hasChanges()) {
            setShowCancelConfirm(true);
        } else {
            navigate('/reports/filters');
        }
    };

    const hasChanges = () => {
        if (!filter || !formData) return false;
        return JSON.stringify(filter) !== JSON.stringify({ ...filter, ...formData });
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading filter..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load filter"
            />
        );
    }

    if (!filter || !formData) {
        return <ReportError error="Filter not found" title="Filter not found" />;
    }

    return (
        <div className="filter-form-container">
            <div className="filter-form-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Cancel
                </button>
                <h1 className="page-title">Edit Filter: {filter.name}</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name.trim()}
                >
                    <FiSave size={18} />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <form className="filter-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="name">Filter Name *</label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter filter name"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="filter_type">Filter Type</label>
                            <input
                                id="filter_type"
                                type="text"
                                value={filter.filter_type || ''}
                                disabled
                                className="disabled-input"
                            />
                            <small className="helper-text">Filter type cannot be changed</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="display_label">Display Label</label>
                            <input
                                id="display_label"
                                type="text"
                                value={formData.display_label}
                                onChange={(e) => handleChange('display_label', e.target.value)}
                                placeholder="Display label (optional)"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="placeholder">Placeholder</label>
                            <input
                                id="placeholder"
                                type="text"
                                value={formData.placeholder}
                                onChange={(e) => handleChange('placeholder', e.target.value)}
                                placeholder="Placeholder text (optional)"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="help_text">Help Text</label>
                            <input
                                id="help_text"
                                type="text"
                                value={formData.help_text}
                                onChange={(e) => handleChange('help_text', e.target.value)}
                                placeholder="Help text (optional)"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.required}
                                    onChange={(e) => handleChange('required', e.target.checked)}
                                />
                                Required
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.multiple}
                                    onChange={(e) => handleChange('multiple', e.target.checked)}
                                />
                                Multiple Selection
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_global}
                                    onChange={(e) => handleChange('is_global', e.target.checked)}
                                />
                                Global Filter
                            </label>
                        </div>
                    </div>
                </div>

                {(filter.filter_type === 'dropdown' || filter.filter_type === 'multi_select') && (
                    <div className="form-section">
                        <h3 className="section-title">Options</h3>
                        <div className="options-list">
                            {formData.options.map((option, index) => (
                                <div key={index} className="option-item">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        placeholder={`Option ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleRemoveOption(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-outline btn-sm add-option"
                                onClick={handleAddOption}
                            >
                                + Add Option
                            </button>
                        </div>
                    </div>
                )}

                <div className="form-section">
                    <h3 className="section-title">Default Values</h3>
                    <div className="default-values-list">
                        {formData.default_values.map((value, index) => (
                            <div key={index} className="default-value-item">
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => handleDefaultValueChange(index, e.target.value)}
                                    placeholder={`Default value ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemoveDefaultValue(index)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-outline btn-sm add-default"
                            onClick={handleAddDefaultValue}
                        >
                            + Add Default Value
                        </button>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Validation Rules</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <textarea
                                value={JSON.stringify(formData.validation, null, 2)}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        handleChange('validation', parsed);
                                    } catch {
                                        // Invalid JSON, keep as is
                                    }
                                }}
                                placeholder='{"min_length": 3, "max_length": 100}'
                                rows={4}
                                className="code-editor"
                            />
                            <small className="helper-text">Enter validation rules as JSON</small>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Dependencies</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <input
                                type="text"
                                value={formData.dependencies.join(', ')}
                                onChange={(e) => {
                                    const deps = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                                    handleChange('dependencies', deps);
                                }}
                                placeholder="Comma-separated dependency names"
                            />
                            <small className="helper-text">Enter dependency names separated by commas</small>
                        </div>
                    </div>
                </div>
            </form>

            <ReportConfirmDialog
                isOpen={showCancelConfirm}
                title="Discard Changes"
                message="You have unsaved changes. Are you sure you want to leave?"
                confirmText="Discard"
                confirmVariant="danger"
                onConfirm={() => {
                    setShowCancelConfirm(false);
                    navigate('/reports/filters');
                }}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};