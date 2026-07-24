// frontend/src/components/reports/reports/ReportEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useReport } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import './reports.css';

export const ReportEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        report,
        loading,
        error,
        fetchOne,
        update,
        clearErrors,
    } = useReport(id, { autoFetch: true });

    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        if (report) {
            setFormData({
                name: report.name || '',
                description: report.description || '',
                report_type: report.report_type || 'kpi',
                default_format: report.default_format || 'pdf',
                category: report.category || 'operational',
                data_source: report.data_source || 'kpi',
                include_executive_summary: report.include_executive_summary !== undefined ? report.include_executive_summary : true,
                include_charts: report.include_charts !== undefined ? report.include_charts : true,
                include_tables: report.include_tables !== undefined ? report.include_tables : true,
                include_commentary: report.include_commentary !== undefined ? report.include_commentary : true,
                config: report.config || {},
                parameters: report.parameters || {},
                filters: report.filters || {},
                sorting: report.sorting || [],
                grouping: report.grouping || [],
                aggregation: report.aggregation || {},
                allowed_roles: report.allowed_roles || [],
                allowed_departments: report.allowed_departments || [],
                tags: report.tags || [],
                cache_ttl: report.cache_ttl || 3600,
                is_public: report.is_public || false,
                is_published: report.is_published || false,
                is_archived: report.is_archived || false,
            });
        }
    }, [report]);

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
        if (!formData) return;
        setIsSubmitting(true);
        try {
            await update(id, formData);
            navigate(`/reports/${id}`);
        } catch (err) {
            console.error('Failed to update report:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (hasChanges()) {
            setShowCancelConfirm(true);
        } else {
            navigate(`/reports/${id}`);
        }
    };

    const hasChanges = () => {
        if (!report || !formData) return false;
        return JSON.stringify(report) !== JSON.stringify({ ...report, ...formData });
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading report..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load report"
            />
        );
    }

    if (!report || !formData) {
        return <ReportError error="Report not found" title="Report not found" />;
    }

    const reportTypes = [
        { value: 'kpi', label: 'KPI Performance Report' },
        { value: 'departmental', label: 'Departmental Performance Report' },
        { value: 'executive', label: 'Executive Summary Report' },
        { value: 'compliance', label: 'Compliance Report' },
        { value: 'trend', label: 'Trend Analysis Report' },
        { value: 'comparative', label: 'Comparative Report' },
        { value: 'mission', label: 'Mission Status Report' },
        { value: 'pip', label: 'PIP Tracking Report' },
        { value: 'custom', label: 'Custom Report' },
    ];

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
                <h1 className="page-title">Edit Report: {report.name}</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name.trim()}
                >
                    <FiSave size={18} />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
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
                            <label htmlFor="report_type">Report Type</label>
                            <input
                                id="report_type"
                                type="text"
                                value={report.report_type}
                                disabled
                                className="disabled-input"
                            />
                            <small className="helper-text">Report type cannot be changed</small>
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
                                Published
                            </label>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_archived}
                                    onChange={(e) => handleChange('is_archived', e.target.checked)}
                                />
                                Archived
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
                    navigate(`/reports/${id}`);
                }}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};