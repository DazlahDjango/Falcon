import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { PlanService } from '../../../services/billing';

export const PlanFormModal = ({ isOpen, onClose, plan }) => {
    const [formData, setFormData] = useState({
        name: '',
        plan_type: 'basic',
        billing_interval: 'monthly',
        price: 0,
        yearly_price: null,
        currency: 'KES',
        description: '',
        max_users: 10,
        max_kpis: 50,
        custom_branding: false,
        api_access: false,
        sso_enabled: false,
        advanced_analytics: false,
        audit_logs: true,
        custom_reports: false,
        priority_support: false,
        is_active: true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (plan) {
            setFormData({
                ...formData,
                ...plan,
                price: plan.price / 100,
                yearly_price: plan.yearly_price ? plan.yearly_price / 100 : null,
            });
        }
    }, [plan]);

    if (!isOpen) return null;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const submitData = {
                ...formData,
                price: formData.price * 100,
                yearly_price: formData.yearly_price ? formData.yearly_price * 100 : null,
            };
            
            if (plan) {
                await PlanService.updatePlan(plan.id, submitData);
            } else {
                await PlanService.createPlan(submitData);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save plan');
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal plan-form-modal">
                <div className="modal-header">
                    <h3 className="modal-title">{plan ? 'Edit Plan' : 'Create Plan'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && (
                            <div className="form-error">{error}</div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label>Plan Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Plan Type</label>
                                <select
                                    value={formData.plan_type}
                                    onChange={(e) => handleChange('plan_type', e.target.value)}
                                >
                                    <option value="trial">Trial</option>
                                    <option value="basic">Basic</option>
                                    <option value="professional">Professional</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Monthly Price (KES)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                    min="0"
                                    step="100"
                                />
                            </div>
                            <div className="form-group">
                                <label>Yearly Price (KES)</label>
                                <input
                                    type="number"
                                    value={formData.yearly_price || ''}
                                    onChange={(e) => handleChange('yearly_price', e.target.value ? parseFloat(e.target.value) : null)}
                                    min="0"
                                    step="100"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Max Users</label>
                                <input
                                    type="number"
                                    value={formData.max_users}
                                    onChange={(e) => handleChange('max_users', parseInt(e.target.value))}
                                    min="-1"
                                />
                                <small>-1 = Unlimited</small>
                            </div>
                            <div className="form-group">
                                <label>Max KPIs</label>
                                <input
                                    type="number"
                                    value={formData.max_kpis}
                                    onChange={(e) => handleChange('max_kpis', parseInt(e.target.value))}
                                    min="-1"
                                />
                                <small>-1 = Unlimited</small>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows="3"
                            />
                        </div>

                        <div className="form-section">
                            <h4>Features</h4>
                            <div className="features-grid">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.custom_branding}
                                        onChange={(e) => handleChange('custom_branding', e.target.checked)}
                                    />
                                    Custom Branding
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.api_access}
                                        onChange={(e) => handleChange('api_access', e.target.checked)}
                                    />
                                    API Access
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.sso_enabled}
                                        onChange={(e) => handleChange('sso_enabled', e.target.checked)}
                                    />
                                    SSO Enabled
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.advanced_analytics}
                                        onChange={(e) => handleChange('advanced_analytics', e.target.checked)}
                                    />
                                    Advanced Analytics
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.audit_logs}
                                        onChange={(e) => handleChange('audit_logs', e.target.checked)}
                                    />
                                    Audit Logs
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.custom_reports}
                                        onChange={(e) => handleChange('custom_reports', e.target.checked)}
                                    />
                                    Custom Reports
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.priority_support}
                                        onChange={(e) => handleChange('priority_support', e.target.checked)}
                                    />
                                    Priority Support
                                </label>
                            </div>
                        </div>

                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.target.checked)}
                            />
                            Active (visible to customers)
                        </label>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="modal-btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : (plan ? 'Update Plan' : 'Create Plan')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

PlanFormModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    plan: PropTypes.object,
};

export default PlanFormModal;