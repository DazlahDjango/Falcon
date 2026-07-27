// frontend/src/components/reports/schedules/ScheduleCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiMail, FiGlobe } from 'react-icons/fi';
import { useSchedules, useReports } from '../../../hooks/reports';
import { ReportLoading, ReportError, ReportConfirmDialog } from '../common';
import './schedules.css';

export const ScheduleCreate = () => {
    const navigate = useNavigate();
    const { create, loading, error, clearErrors } = useSchedules({ autoFetch: false });
    const { fetchList: fetchReports, reports } = useReports({ autoFetch: false });

    const [formData, setFormData] = useState({
        name: '',
        report: '',
        frequency: 'daily',
        cron_expression: '',
        recipients: [],
        cc_recipients: [],
        bcc_recipients: [],
        delivery_method: ['email'],
        webhook_url: '',
        s3_path: '',
        is_active: true,
        is_paused: false,
        max_retries: 3,
        retry_delay: 300,
        timezone: 'Africa/Nairobi',
        custom_params: {},
        include_attachments: true,
        compress_attachments: false,
        password_protect: false,
        password: '',
        expiry_days: 30,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        fetchReports({ pageSize: 100 });
    }, [fetchReports]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleRecipientAdd = (type) => {
        const input = document.getElementById(`${type}_input`);
        if (input && input.value) {
            const email = input.value.trim();
            if (email && !formData[type].includes(email)) {
                setFormData((prev) => ({
                    ...prev,
                    [type]: [...prev[type], email],
                }));
            }
            input.value = '';
        }
    };

    const handleRecipientRemove = (type, email) => {
        setFormData((prev) => ({
            ...prev,
            [type]: prev[type].filter((e) => e !== email),
        }));
    };

    const handleRecipientKeyDown = (e, type) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleRecipientAdd(type);
        }
    };

    const handleDeliveryMethodToggle = (method) => {
        setFormData((prev) => ({
            ...prev,
            delivery_method: prev.delivery_method.includes(method)
                ? prev.delivery_method.filter((m) => m !== method)
                : [...prev.delivery_method, method],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await create(formData);
            if (result) {
                navigate(`/reports/schedules/${result.id}`);
            }
        } catch (err) {
            console.error('Failed to create schedule:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        if (formData.name || formData.recipients.length > 0) {
            setShowCancelConfirm(true);
        } else {
            navigate('/reports/schedules');
        }
    };

    const getFrequencyOptions = () => {
        return [
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'biweekly', label: 'Bi-Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'biannual', label: 'Bi-Annual' },
            { value: 'annual', label: 'Annual' },
            { value: 'custom', label: 'Custom' },
        ];
    };

    const deliveryMethods = [
        { value: 'email', label: 'Email' },
        { value: 'download', label: 'Download Link' },
        { value: 's3', label: 'S3 Storage' },
        { value: 'webhook', label: 'Webhook' },
    ];

    if (loading) {
        return <ReportLoading variant="spinner" text="Loading..." />;
    }

    if (error) {
        return (
            <ReportError
                error={error}
                onRetry={() => clearErrors()}
                title="Failed to create schedule"
            />
        );
    }

    const frequencyOptions = getFrequencyOptions();

    return (
        <div className="schedule-form-container">
            <div className="schedule-form-header">
                <button className="btn btn-outline back-btn" onClick={handleBack}>
                    <FiArrowLeft size={18} />
                    Cancel
                </button>
                <h1 className="page-title">Create Schedule</h1>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !formData.name.trim() || !formData.report}
                >
                    <FiSave size={18} />
                    {isSubmitting ? 'Creating...' : 'Create Schedule'}
                </button>
            </div>

            <div className="schedule-tabs">
                <button
                    className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                >
                    Basic Info
                </button>
                <button
                    className={`tab-btn ${activeTab === 'delivery' ? 'active' : ''}`}
                    onClick={() => setActiveTab('delivery')}
                >
                    Delivery
                </button>
                <button
                    className={`tab-btn ${activeTab === 'advanced' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advanced')}
                >
                    Advanced
                </button>
            </div>

            <form className="schedule-form" onSubmit={handleSubmit}>
                {activeTab === 'basic' && (
                    <div className="form-section">
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label htmlFor="name">Schedule Name *</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Enter schedule name"
                                    required
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label htmlFor="report">Report *</label>
                                <select
                                    id="report"
                                    value={formData.report}
                                    onChange={(e) => handleChange('report', e.target.value)}
                                    required
                                >
                                    <option value="">Select a report...</option>
                                    {reports.map((report) => (
                                        <option key={report.id} value={report.id}>
                                            {report.name} ({report.report_type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="frequency">Frequency *</label>
                                <select
                                    id="frequency"
                                    value={formData.frequency}
                                    onChange={(e) => handleChange('frequency', e.target.value)}
                                    required
                                >
                                    {frequencyOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {formData.frequency === 'custom' && (
                                <div className="form-group">
                                    <label htmlFor="cron_expression">Cron Expression *</label>
                                    <input
                                        id="cron_expression"
                                        type="text"
                                        value={formData.cron_expression}
                                        onChange={(e) => handleChange('cron_expression', e.target.value)}
                                        placeholder="0 0 * * *"
                                        required
                                    />
                                    <small className="helper-text">
                                        e.g., 0 0 * * * for daily at midnight
                                    </small>
                                </div>
                            )}
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="timezone">Timezone</label>
                                <select
                                    id="timezone"
                                    value={formData.timezone}
                                    onChange={(e) => handleChange('timezone', e.target.value)}
                                >
                                    <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">America/New_York (EST)</option>
                                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                                    <option value="Europe/London">Europe/London (GMT)</option>
                                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="expiry_days">Expiry Days</label>
                                <input
                                    id="expiry_days"
                                    type="number"
                                    value={formData.expiry_days}
                                    onChange={(e) => handleChange('expiry_days', parseInt(e.target.value) || 30)}
                                    min="1"
                                    max="365"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => handleChange('is_active', e.target.checked)}
                                    />
                                    Active
                                </label>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.is_paused}
                                        onChange={(e) => handleChange('is_paused', e.target.checked)}
                                    />
                                    Paused
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'delivery' && (
                    <div className="form-section">
                        <h3 className="section-title">Delivery Methods</h3>
                        <div className="delivery-methods">
                            {deliveryMethods.map((method) => (
                                <label key={method.value} className="delivery-method-check">
                                    <input
                                        type="checkbox"
                                        checked={formData.delivery_method.includes(method.value)}
                                        onChange={() => handleDeliveryMethodToggle(method.value)}
                                    />
                                    {method.label}
                                </label>
                            ))}
                        </div>

                        {formData.delivery_method.includes('email') && (
                            <div className="form-section">
                                <h3 className="section-title">
                                    <FiMail size={16} />
                                    Email Recipients
                                </h3>
                                {['recipients', 'cc_recipients', 'bcc_recipients'].map((type) => (
                                    <div key={type} className="recipient-group">
                                        <label>
                                            {type === 'recipients' ? 'To' : type === 'cc_recipients' ? 'CC' : 'BCC'}
                                        </label>
                                        <div className="recipient-input-group">
                                            <input
                                                id={`${type}_input`}
                                                type="email"
                                                placeholder={`Enter ${type === 'recipients' ? 'recipient' : type} email`}
                                                onKeyDown={(e) => handleRecipientKeyDown(e, type)}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleRecipientAdd(type)}
                                            >
                                                <FiPlus size={14} />
                                                Add
                                            </button>
                                        </div>
                                        <div className="recipient-tags">
                                            {formData[type].map((email) => (
                                                <span key={email} className="recipient-tag">
                                                    {email}
                                                    <button
                                                        type="button"
                                                        className="recipient-remove"
                                                        onClick={() => handleRecipientRemove(type, email)}
                                                    >
                                                        ✕
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {formData.delivery_method.includes('webhook') && (
                            <div className="form-section">
                                <h3 className="section-title">Webhook Configuration</h3>
                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label htmlFor="webhook_url">Webhook URL</label>
                                        <input
                                            id="webhook_url"
                                            type="url"
                                            value={formData.webhook_url}
                                            onChange={(e) => handleChange('webhook_url', e.target.value)}
                                            placeholder="https://example.com/webhook"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.delivery_method.includes('s3') && (
                            <div className="form-section">
                                <h3 className="section-title">S3 Configuration</h3>
                                <div className="form-row">
                                    <div className="form-group full-width">
                                        <label htmlFor="s3_path">S3 Path</label>
                                        <input
                                            id="s3_path"
                                            type="text"
                                            value={formData.s3_path}
                                            onChange={(e) => handleChange('s3_path', e.target.value)}
                                            placeholder="reports/{{tenant_id}}/{{report_id}}/"
                                        />
                                        <small className="helper-text">
                                            Use {'{{tenant_id}}'}, {'{{report_id}}'}, {'{{date}}'} as variables
                                        </small>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="form-section">
                        <h3 className="section-title">Attachment Settings</h3>
                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.include_attachments}
                                        onChange={(e) => handleChange('include_attachments', e.target.checked)}
                                    />
                                    Include Attachments
                                </label>
                            </div>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.compress_attachments}
                                        onChange={(e) => handleChange('compress_attachments', e.target.checked)}
                                    />
                                    Compress Attachments
                                </label>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={formData.password_protect}
                                        onChange={(e) => handleChange('password_protect', e.target.checked)}
                                    />
                                    Password Protect
                                </label>
                            </div>
                            {formData.password_protect && (
                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        id="password"
                                        type="text"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="Enter password"
                                    />
                                </div>
                            )}
                        </div>

                        <h3 className="section-title" style={{ marginTop: 24 }}>
                            Retry Configuration
                        </h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="max_retries">Max Retries</label>
                                <input
                                    id="max_retries"
                                    type="number"
                                    value={formData.max_retries}
                                    onChange={(e) => handleChange('max_retries', parseInt(e.target.value) || 3)}
                                    min="0"
                                    max="10"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="retry_delay">Retry Delay (seconds)</label>
                                <input
                                    id="retry_delay"
                                    type="number"
                                    value={formData.retry_delay}
                                    onChange={(e) => handleChange('retry_delay', parseInt(e.target.value) || 300)}
                                    min="30"
                                    step="30"
                                />
                            </div>
                        </div>

                        <h3 className="section-title" style={{ marginTop: 24 }}>
                            Custom Parameters
                        </h3>
                        <div className="form-row">
                            <div className="form-group full-width">
                                <label htmlFor="custom_params">Custom Parameters (JSON)</label>
                                <textarea
                                    id="custom_params"
                                    value={JSON.stringify(formData.custom_params, null, 2)}
                                    onChange={(e) => {
                                        try {
                                            const parsed = JSON.parse(e.target.value);
                                            handleChange('custom_params', parsed);
                                        } catch {
                                            // Invalid JSON
                                        }
                                    }}
                                    rows={4}
                                    className="code-editor"
                                    placeholder="{}"
                                />
                                <small className="helper-text">
                                    Parameters to pass to the report generation
                                </small>
                            </div>
                        </div>
                    </div>
                )}
            </form>

            <ReportConfirmDialog
                isOpen={showCancelConfirm}
                title="Discard Changes"
                message="You have unsaved changes. Are you sure you want to leave?"
                confirmText="Discard"
                confirmVariant="danger"
                onConfirm={() => {
                    setShowCancelConfirm(false);
                    navigate('/reports/schedules');
                }}
                onCancel={() => setShowCancelConfirm(false)}
            />
        </div>
    );
};