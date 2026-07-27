// frontend/src/components/reports/filters/FilterApply.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import { useFilter, useFilters } from '../../../hooks/reports';
import { ReportLoading, ReportError } from '../common';
import './filters.css';

export const FilterApply = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [values, setValues] = useState({});
    const [isApplying, setIsApplying] = useState(false);
    const [applyResult, setApplyResult] = useState(null);

    const {
        filter,
        loading,
        error,
        fetchOne,
        clearErrors,
    } = useFilter(id, { autoFetch: true });

    const { applyFilter } = useFilters({ autoFetch: false });

    useEffect(() => {
        if (filter) {
            setValues(filter.values || {});
        }
    }, [filter]);

    const handleValueChange = (field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const handleApply = async () => {
        setIsApplying(true);
        try {
            const result = await applyFilter(id, values);
            setApplyResult(result);
        } catch (err) {
            console.error('Failed to apply filter:', err);
        } finally {
            setIsApplying(false);
        }
    };

    const handleBack = () => {
        navigate('/reports/filters');
    };

    const renderFilterInput = (filterConfig) => {
        const type = filterConfig.filter_type;
        const value = values[filterConfig.name] || '';

        switch (type) {
            case 'date_range':
                return (
                    <div className="date-range-inputs">
                        <input
                            type="date"
                            value={value.start || ''}
                            onChange={(e) => handleValueChange(filterConfig.name, { ...value, start: e.target.value })}
                            placeholder="Start date"
                        />
                        <input
                            type="date"
                            value={value.end || ''}
                            onChange={(e) => handleValueChange(filterConfig.name, { ...value, end: e.target.value })}
                            placeholder="End date"
                        />
                    </div>
                );
            case 'dropdown':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleValueChange(filterConfig.name, e.target.value)}
                    >
                        <option value="">Select...</option>
                        {filterConfig.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'multi_select':
                return (
                    <div className="multi-select-options">
                        {filterConfig.options?.map((opt) => (
                            <label key={opt} className="multi-select-option">
                                <input
                                    type="checkbox"
                                    checked={Array.isArray(value) && value.includes(opt)}
                                    onChange={(e) => {
                                        const current = Array.isArray(value) ? value : [];
                                        if (e.target.checked) {
                                            handleValueChange(filterConfig.name, [...current, opt]);
                                        } else {
                                            handleValueChange(filterConfig.name, current.filter((v) => v !== opt));
                                        }
                                    }}
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                );
            case 'text':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleValueChange(filterConfig.name, e.target.value)}
                        placeholder={filterConfig.placeholder || 'Enter value...'}
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleValueChange(filterConfig.name, e.target.value)}
                        placeholder={filterConfig.placeholder || 'Enter number...'}
                    />
                );
            case 'boolean':
                return (
                    <div className="boolean-options">
                        <label>
                            <input
                                type="radio"
                                checked={value === true}
                                onChange={() => handleValueChange(filterConfig.name, true)}
                            />
                            Yes
                        </label>
                        <label>
                            <input
                                type="radio"
                                checked={value === false}
                                onChange={() => handleValueChange(filterConfig.name, false)}
                            />
                            No
                        </label>
                        <label>
                            <input
                                type="radio"
                                checked={value === '' || value === null}
                                onChange={() => handleValueChange(filterConfig.name, null)}
                            />
                            Any
                        </label>
                    </div>
                );
            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleValueChange(filterConfig.name, e.target.value)}
                        placeholder="Enter value..."
                    />
                );
        }
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

    if (!filter) {
        return <ReportError error="Filter not found" title="Filter not found" />;
    }

    return (
        <div className="filter-apply-container">
            <div className="filter-apply-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Back to Filters
                </button>
                <h1 className="page-title">Apply Filter: {filter.name}</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleApply}
                    disabled={isApplying}
                >
                    <FiCheck size={18} />
                    {isApplying ? 'Applying...' : 'Apply Filter'}
                </button>
            </div>

            <div className="filter-apply-card">
                <div className="filter-info">
                    <span className="filter-type-badge">{filter.filter_type}</span>
                    {filter.display_label && (
                        <span className="filter-display-label">{filter.display_label}</span>
                    )}
                    {filter.help_text && (
                        <p className="filter-help-text">{filter.help_text}</p>
                    )}
                </div>

                <div className="filter-values-section">
                    {applyResult && (
                        <div className="apply-result">
                            <div className="result-header">
                                <span className="result-icon">✅</span>
                                <span className="result-title">Filter Applied Successfully</span>
                            </div>
                            <div className="result-details">
                                <pre>{JSON.stringify(applyResult, null, 2)}</pre>
                            </div>
                            <button
                                className="btn btn-primary result-close"
                                onClick={() => setApplyResult(null)}
                            >
                                <FiX size={16} />
                                Close
                            </button>
                        </div>
                    )}

                    {!applyResult && (
                        <>
                            <div className="filter-fields">
                                {filter.config?.fields?.map((field) => (
                                    <div key={field.name} className="filter-field">
                                        <label className="field-label">
                                            {field.label || field.name}
                                            {field.required && <span className="required-star">*</span>}
                                        </label>
                                        {renderFilterInput({
                                            ...field,
                                            filter_type: filter.filter_type,
                                            options: filter.options,
                                            placeholder: filter.placeholder,
                                        })}
                                    </div>
                                ))}
                                {(!filter.config?.fields || filter.config.fields.length === 0) && (
                                    <div className="filter-field">
                                        <label className="field-label">Value</label>
                                        {renderFilterInput(filter)}
                                    </div>
                                )}
                            </div>

                            <div className="filter-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setValues({})}
                                >
                                    Clear Values
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleApply}
                                    disabled={isApplying}
                                >
                                    <FiCheck size={16} />
                                    {isApplying ? 'Applying...' : 'Apply'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};