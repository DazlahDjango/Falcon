// frontend/src/components/reports/dashboards/DashboardEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useDashboard } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import './dashboards.css';

export const DashboardEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        dashboard,
        loading,
        error,
        fetchOne,
        update,
        clearErrors,
    } = useDashboard(id, { autoFetch: true });

    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        if (dashboard) {
            setFormData({
                name: dashboard.name || '',
                description: dashboard.description || '',
                dashboard_type: dashboard.dashboard_type || 'personal',
                layout: dashboard.layout || {
                    grid_columns: 12,
                    row_height: 100,
                    spacing: 10,
                    theme: 'light',
                    auto_refresh: true,
                    refresh_interval: 300,
                },
                config: dashboard.config || {},
                theme: dashboard.theme || { mode: 'light', primary_color: '#2563eb' },
                refresh_interval: dashboard.refresh_interval || 300,
                allowed_roles: dashboard.allowed_roles || [],
                allowed_users: dashboard.allowed_users || [],
                allowed_departments: dashboard.allowed_departments || [],
                tags: dashboard.tags || [],
                is_default: dashboard.is_default || false,
                is_shared: dashboard.is_shared || false,
                is_published: dashboard.is_published || false,
            });
        }
    }, [dashboard]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleLayoutChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            layout: { ...prev.layout, [field]: value },
        }));
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
            navigate(`/reports/dashboards/${id}`);
        } catch (err) {
            console.error('Failed to update dashboard:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (hasChanges()) {
            setShowCancelConfirm(true);
        } else {
            navigate(`/reports/dashboards/${id}`);
        }
    };

    const hasChanges = () => {
        if (!dashboard || !formData) return false;
        return JSON.stringify(dashboard) !== JSON.stringify({ ...dashboard, ...formData });
    };

    if (loading) {
        return <ReportLoading variant="skeleton" text="Loading dashboard..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => {
                    clearErrors();
                    fetchOne(id);
                }}
                title="Failed to load dashboard"
            />
        );
    }

    if (!dashboard || !formData) {
        return <ReportError error="Dashboard not found" title="Dashboard not found" />;
    }

    const dashboardTypes = [
        { value: 'executive', label: 'Executive Dashboard' },
        { value: 'departmental', label: 'Departmental Dashboard' },
        { value: 'team', label: 'Team Dashboard' },
        { value: 'personal', label: 'Personal Dashboard' },
        { value: 'custom', label: 'Custom Dashboard' },
    ];

    return (
        <div className="dashboard-form-container">
            <div className="dashboard-form-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Cancel
                </button>
                <h1 className="page-title">Edit Dashboard: {dashboard.name}</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name.trim()}
                >
                    <FiSave size={18} />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <form className="dashboard-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3 className="section-title">Basic Information</h3>
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="name">Dashboard Name *</label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Enter dashboard name"
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
                                placeholder="Enter dashboard description"
                                rows={3}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dashboard_type">Dashboard Type</label>
                            <input
                                id="dashboard_type"
                                type="text"
                                value={dashboard.dashboard_type}
                                disabled
                                className="disabled-input"
                            />
                            <small className="helper-text">Dashboard type cannot be changed</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="theme_mode">Theme Mode</label>
                            <select
                                id="theme_mode"
                                value={formData.theme.mode}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        theme: { ...prev.theme, mode: e.target.value },
                                    }))
                                }
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="primary_color">Primary Color</label>
                            <input
                                id="primary_color"
                                type="color"
                                value={formData.theme.primary_color}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        theme: { ...prev.theme, primary_color: e.target.value },
                                    }))
                                }
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="refresh_interval">Refresh Interval (seconds)</label>
                            <input
                                id="refresh_interval"
                                type="number"
                                value={formData.refresh_interval}
                                onChange={(e) => handleChange('refresh_interval', parseInt(e.target.value) || 300)}
                                min="30"
                                step="30"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="section-title">Layout Configuration</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="grid_columns">Grid Columns</label>
                            <input
                                id="grid_columns"
                                type="number"
                                value={formData.layout.grid_columns}
                                onChange={(e) => handleLayoutChange('grid_columns', parseInt(e.target.value) || 12)}
                                min="1"
                                max="24"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="row_height">Row Height</label>
                            <input
                                id="row_height"
                                type="number"
                                value={formData.layout.row_height}
                                onChange={(e) => handleLayoutChange('row_height', parseInt(e.target.value) || 100)}
                                min="20"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="spacing">Spacing</label>
                            <input
                                id="spacing"
                                type="number"
                                value={formData.layout.spacing}
                                onChange={(e) => handleLayoutChange('spacing', parseInt(e.target.value) || 10)}
                                min="0"
                            />
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.layout.auto_refresh}
                                    onChange={(e) => handleLayoutChange('auto_refresh', e.target.checked)}
                                />
                                Auto-Refresh
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
                                    checked={formData.is_default}
                                    onChange={(e) => handleChange('is_default', e.target.checked)}
                                />
                                Default Dashboard
                            </label>
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.is_shared}
                                    onChange={(e) => handleChange('is_shared', e.target.checked)}
                                />
                                Shared
                            </label>
                        </div>
                    </div>
                    <div className="form-row">
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
                    navigate(`/reports/dashboards/${id}`);
                }}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};