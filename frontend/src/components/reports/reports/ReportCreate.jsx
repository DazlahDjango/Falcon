// frontend/src/components/reports/reports/ReportCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useReports } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import { REPORT_TYPE_LABELS, REPORT_CATEGORY_LABELS, REPORT_FORMAT_LABELS } from '../../../config/constants/reportConstants';
import './reports.css';

export const ReportCreate = () => {
    const navigate = useNavigate();
    const { create, loading, error, clearErrors } = useReports({ autoFetch: false });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        report_type: 'kpi',
        default_format: 'pdf',
        category: 'operational',
        data_source: 'kpi',
        include_executive_summary: true,
        include_charts: true,
        include_tables: true,
        include_commentary: true,
        config: {},
        parameters: {},
        filters: {},
        sorting: [],
        grouping: [],
        aggregation: {},
        allowed_roles: [],
        allowed_departments: [],
        tags: [],
        cache_ttl: 3600,
        is_public: false,
        is_published: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleTagAdd = (e) => {
        if (e.key === 'Enter' && e.target.value) {
            const tag = e.target.value.trim();
            if (tag && !formData.tags.includes(tag)) {
                setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
            }
            e.target.value = '';
        }
    };

    const handleTagRemove = (tag) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((t) => t !== tag),
        }));
    };

    const handleRoleAdd = (e) => {
        if (e.key === 'Enter' && e.target.value) {
            const role = e.target.value.trim();
            if (role && !formData.allowed_roles.includes(role)) {
                setFormData((prev) => ({ ...prev, allowed_roles: [...prev.allowed_roles, role] }));
            }
            e.target.value = '';
        }
    };

    const handleRoleRemove = (role) => {
        setFormData((prev) => ({
            ...prev,
            allowed_roles: prev.allowed_roles.filter((r) => r !== role),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await create(formData);
            if (result) {
                navigate(`/reports/${result.id}`);
            }
        } catch (err) {
            console.error('Failed to create report:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (formData.name) {
            setShowCancelConfirm(true);
        } else {
            navigate('/reports');
        }
    };

    if (loading) {
        return <ReportLoading variant="spinner" text="Creating report..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => clearErrors()}
                title="Failed to create report"
            />
        );
    }

    const reportTypes = Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => ({
        value,
        label,
    }));

    const formats = [
        { value: 'pdf', label: 'PDF' },
        { value: 'excel', label: 'Excel' },
        { value: 'csv', label: 'CSV' },
        { value: 'json', label: 'JSON' },
        { value: 'pptx', label: 'PowerPoint' },
        { value: 'html', label: 'HTML' },
    ];

    const categories = [
        { value: 'operational', label: 'Operational' },
        { value: 'strategic', label: 'Strategic' },
        { value: 'financial', label: 'Financial' },
        { value: 'hr', label: 'Human Resources' },
        { value: 'compliance', label: 'Compliance' },
        { value: 'impact', label: 'Impact' },
        { value: 'project', label: 'Project' },
    ];

    return (
        <div className="report-form-container">
            <div className="report-form-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Cancel
                </button>
                <h1 className="page-title">Create Report</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name.trim()}
                >
                    <FiSave size={18} />
                    {isSubmitting ? 'Creating...' : 'Create Report'}
                </button>
            </div>

            <form className="report-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className="section-title">Basic Information</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="name">Report Name *</label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter report name"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Enter report description"
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="report_type">Report Type *</label>
                            <select
                                id="report_type"
                                value={formData.report_type}
                                onChange={(e) => handleChange('report_type', e.target.value)}
                                required
                            >
                                {reportTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="default_format">Default Format</label>
                            <select
                                id="default_format"
                                value={formData.default_format}
                                onChange={(e) => handleChange('default_format', e.target.value)}
                            >
                                {formats.map((fmt) => (
                                    <option key={fmt.value} value={fmt.value}>
                                        {fmt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="data_source">Data Source</label>
                            <select
                                id="data_source"
                                value={formData.data_source}
                                onChange={(e) => handleChange('data_source', e.target.value)}
                            >
                                <option value="kpi">KPI Data</option>
                                <option value="reviews">Review Data</option>
                                <option value="tasks">Task Data</option>
                                <option value="pip">PIP Data</option>
                                <option value="combined">Combined Data</option>
                                <option value="configs">System Configs Data</option>
                                <option value="tenant">Multi-Tenant Data</option>
                                <option value="structure">Org Structure Data</option>
                                <option value="accounts">Accounts & Security Data</option>
                                <option value="billing">Billing & Financial Data</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Content Settings</h3>
                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.include_executive_summary}
                                    onChange={(e) => handleChange('include_executive_summary', e.target.checked)}
                                />
                                Include Executive Summary
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.include_charts}
                                    onChange={(e) => handleChange('include_charts', e.target.checked)}
                                />
                                Include Charts
                            </label>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.include_tables}
                                    onChange={(e) => handleChange('include_tables', e.target.checked)}
                                />
                                Include Tables
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.include_commentary}
                                    onChange={(e) => handleChange('include_commentary', e.target.checked)}
                                />
                                Include Commentary
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Tags</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <input
                                type="text"
                                placeholder="Type tag and press Enter"
                                onKeyDown={handleTagAdd}
                                className="tag-input"
                            />
                            <div className="tags-container">
                                {formData.tags.map((tag) => (
                                    <span key={tag} className="tag">
                                        {tag}
                                        <button
                                            type="button"
                                            className="tag-remove"
                                            onClick={() => handleTagRemove(tag)}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Access Control</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label>Allowed Roles</label>
                            <input
                                type="text"
                                placeholder="Type role and press Enter"
                                onKeyDown={handleRoleAdd}
                                className="role-input"
                            />
                            <div className="roles-container">
                                {formData.allowed_roles.map((role) => (
                                    <span key={role} className="role-badge">
                                        {role}
                                        <button
                                            type="button"
                                            className="role-remove"
                                            onClick={() => handleRoleRemove(role)}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_public}
                                    onChange={(e) => handleChange('is_public', e.target.checked)}
                                />
                                Make Public
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_published}
                                    onChange={(e) => handleChange('is_published', e.target.checked)}
                                />
                                Publish Immediately
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Cache Settings</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cache_ttl">Cache TTL (seconds)</label>
                            <input
                                id="cache_ttl"
                                type="number"
                                value={formData.cache_ttl}
                                onChange={(e) => handleChange('cache_ttl', parseInt(e.target.value) || 3600)}
                                min="60"
                                step="60"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Advanced Configuration</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="config">Config (JSON)</label>
                            <textarea
                                id="config"
                                value={JSON.stringify(formData.config, null, 2)}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        handleChange('config', parsed);
                                    } catch {
                                        // Invalid JSON
                                    }
                                }}
                                rows={4}
                                className="code-editor"
                                placeholder="{}"
                            />
                            <small className="helper-text">Enter configuration as JSON</small>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="parameters">Parameters (JSON)</label>
                            <textarea
                                id="parameters"
                                value={JSON.stringify(formData.parameters, null, 2)}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        handleChange('parameters', parsed);
                                    } catch {
                                        // Invalid JSON
                                    }
                                }}
                                rows={4}
                                className="code-editor"
                                placeholder="{}"
                            />
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
                    navigate('/reports');
                }}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};  