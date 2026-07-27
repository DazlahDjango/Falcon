// frontend/src/components/reports/filters/FilterDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiCopy, FiCheck, FiX } from 'react-icons/fi';
import { useFilter } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { FilterStatusBadge } from './FilterStatusBadge';
import './filters.css';

export const FilterDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const {
        filter,
        loading,
        error,
        fetchOne,
        remove,
        clearErrors,
    } = useFilter(id, { autoFetch: true });

    const handleBack = () => {
        navigate('/reports/filters');
    };

    const handleEdit = () => {
        navigate(`/reports/filters/${id}/edit`);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        await remove(id);
        navigate('/reports/filters');
    };

    const handleDuplicate = async () => {
        // This would be implemented with duplicateFilter
        navigate(`/reports/filters/create?duplicate=${id}`);
    };

    const handleApply = () => {
        navigate(`/reports/filters/${id}/apply`);
    };

    const renderFilterValue = (value) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading filter details..." />;
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

    const getFilterTypeLabel = (type) => {
        const labels = {
            date_range: 'Date Range',
            dropdown: 'Dropdown',
            multi_select: 'Multi-Select',
            text: 'Text',
            number: 'Number',
            boolean: 'Boolean',
            hierarchy: 'Hierarchical',
            custom: 'Custom',
        };
        return labels[type] || type;
    };

    return (
        <div className="filter-detail-container">
            <div className="filter-detail-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Back to Filters
                </button>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleApply}>
                        <FiCheck size={18} />
                        Apply Filter
                    </button>
                    <button className="btn btn-secondary" onClick={handleDuplicate}>
                        <FiCopy size={18} />
                        Duplicate
                    </button>
                    <button className="btn btn-secondary" onClick={handleEdit}>
                        <FiEdit2 size={18} />
                        Edit
                    </button>
                    <button className="btn btn-danger" onClick={handleDelete}>
                        <FiTrash2 size={18} />
                        Delete
                    </button>
                </div>
            </div>

            <div className="filter-detail-card">
                <div className="filter-detail-top">
                    <div className="filter-name-section">
                        <h1 className="filter-name">{filter.name}</h1>
                        <div className="filter-badges">
                            <span className="filter-type-badge">{getFilterTypeLabel(filter.filter_type)}</span>
                            {filter.is_global && (
                                <span className="filter-scope-badge global">Global</span>
                            )}
                            {filter.is_default && (
                                <span className="filter-scope-badge default">Default</span>
                            )}
                            {filter.is_system && (
                                <span className="filter-scope-badge system">System</span>
                            )}
                        </div>
                    </div>
                    <div className="filter-meta">
                        <span>Created: {new Date(filter.created_at).toLocaleString()}</span>
                        {filter.owner && (
                            <span>Owner: {filter.owner.name || filter.owner.email}</span>
                        )}
                    </div>
                </div>

                {filter.description && (
                    <div className="filter-description">
                        <p>{filter.description}</p>
                    </div>
                )}

                <div className="filter-detail-grid">
                    <div className="detail-section">
                        <h3 className="section-title">Configuration</h3>
                        <div className="detail-item">
                            <span className="detail-label">Display Label</span>
                            <span className="detail-value">{filter.display_label || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Placeholder</span>
                            <span className="detail-value">{filter.placeholder || '-'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Required</span>
                            <span className="detail-value">{filter.required ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Multiple</span>
                            <span className="detail-value">{filter.multiple ? 'Yes' : 'No'}</span>
                        </div>
                        {filter.help_text && (
                            <div className="detail-item">
                                <span className="detail-label">Help Text</span>
                                <span className="detail-value">{filter.help_text}</span>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3 className="section-title">Default Values</h3>
                        {filter.default_values && filter.default_values.length > 0 ? (
                            <div className="default-values-list">
                                {filter.default_values.map((val, idx) => (
                                    <span key={idx} className="default-value-tag">
                                        {renderFilterValue(val)}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="no-value">No default values set</span>
                        )}
                    </div>

                    {filter.options && filter.options.length > 0 && (
                        <div className="detail-section">
                            <h3 className="section-title">Options</h3>
                            <div className="options-list">
                                {filter.options.map((opt, idx) => (
                                    <span key={idx} className="option-tag">{opt}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {filter.dependencies && filter.dependencies.length > 0 && (
                        <div className="detail-section">
                            <h3 className="section-title">Dependencies</h3>
                            <div className="dependencies-list">
                                {filter.dependencies.map((dep, idx) => (
                                    <span key={idx} className="dependency-tag">{dep}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {filter.validation && Object.keys(filter.validation).length > 0 && (
                        <div className="detail-section">
                            <h3 className="section-title">Validation Rules</h3>
                            <pre className="validation-rules">
                                {JSON.stringify(filter.validation, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {filter.values && Object.keys(filter.values).length > 0 && (
                    <div className="detail-section">
                        <h3 className="section-title">Saved Values</h3>
                        <div className="saved-values">
                            {Object.entries(filter.values).map(([key, value]) => (
                                <div key={key} className="saved-value-item">
                                    <span className="saved-value-key">{key}:</span>
                                    <span className="saved-value-value">{renderFilterValue(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="filter-detail-footer">
                    <div className="footer-meta">
                        <span>Updated: {new Date(filter.updated_at).toLocaleString()}</span>
                        {filter.created_by && (
                            <span>Created by: {filter.created_by.name || filter.created_by.email}</span>
                        )}
                    </div>
                </div>
            </div>

            <ReportConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete Filter"
                message={`Are you sure you want to delete the filter "${filter.name}"? This action cannot be undone.`}
                confirmText="Delete"
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
            />
        </div>
    );
};