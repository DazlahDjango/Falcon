// frontend/src/components/reports/filters/FilterCreate.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useFilters } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { FilterTypes } from './FilterTypes';
import './filters.css';

export const FilterCreate = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const duplicateId = searchParams.get('duplicate');

    const {
        create,
        duplicateFilter,
        loading,
        error,
        clearErrors,
    } = useFilters({ autoFetch: false });

    const [formData, setFormData] = useState({
        name: '',
        filter_type: 'dropdown',
        display_label: '',
        placeholder: '',
        help_text: '',
        required: false,
        multiple: false,
        options: [],
        default_values: [],
        validation: {},
        dependencies: [],
        is_global: false,
        config: {},
        values: {},
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        if (duplicateId) {
            loadDuplicate(duplicateId);
        }
    }, [duplicateId]);

    const loadDuplicate = async (id) => {
        try {
            const result = await duplicateFilter(id);
            if (result) {
                setFormData({
                    ...result,
                    name: `${result.name} (Copy)`,
                });
            }
        } catch (err) {
            console.error('Failed to load filter for duplication:', err);
        }
    };

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
        setIsSubmitting(true);
        try {
            const result = await create(formData);
            if (result) {
                navigate('/reports/filters');
            }
        } catch (err) {
            console.error('Failed to create filter:', err);
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
        return formData.name !== '' || formData.options.length > 0 || formData.default_values.length > 0;
    };

    if (loading && duplicateId) {
        return <ReportLoading variant="spinner" text="Loading filter data..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => clearErrors()}
                title="Failed to create filter"
            />
        );
    }

    return (
        <div className="filter-form-container">
            <div className="filter-form-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Cancel
                </button>
                <h1 className="page-title">{duplicateId ? 'Duplicate Filter' : 'Create Filter'}</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name.trim()}
                >
                    <FiSave size={18} />
                    {isSubmitting ? 'Creating...' : 'Create Filter'}
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
                            <label htmlFor="filter_type">Filter Type *</label>
                            <select
                                id="filter_type"
                                value={formData.filter_type}
                                onChange={(e) => handleChange('filter_type', e.target.value)}
                                required
                            >
                                <option value="date_range">Date Range</option>
                                <option value="dropdown">Dropdown</option>
                                <option value="multi_select">Multi-Select</option>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="hierarchy">Hierarchical</option>
                                <option value="custom">Custom</option>
                            </select>
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

                {(formData.filter_type === 'dropdown' || formData.filter_type === 'multi_select') && (
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
                                        <FiTrash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-outline btn-sm add-option"
                                onClick={handleAddOption}
                            >
                                <FiPlus size={14} />
                                Add Option
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
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-outline btn-sm add-default"
                            onClick={handleAddDefaultValue}
                        >
                            <FiPlus size={14} />
                            Add Default Value
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