import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiAlertCircle } from 'react-icons/fi';
import { usePlans } from '../../../hooks/billing/usePlans';
import './admin.css';

export const PlanFormModal = ({ isOpen, onClose, plan, onSuccess }) => {
    const { addPlan, updatePlan, loading, error } = usePlans();
    const [formData, setFormData] = useState({
        name: '', plan_type: 'basic', price: 0, yearly_price: null, currency: 'KES', description: '',
        max_users: 10, max_kpis: 50, max_departments: 10, max_storage_mb: 100,
        custom_branding: false, api_access: false, sso_enabled: false, advanced_analytics: false,
        priority_support: false, display_order: 0, is_active: true
    });
    const [localError, setLocalError] = useState(null);

    useEffect(() => {
        if (plan) {
            setFormData({
                ...formData,
                ...plan,
                price: plan.price ? plan.price / 100 : 0,
                yearly_price: plan.yearly_price ? plan.yearly_price / 100 : null
            });
        } else {
            setFormData({
                name: '', plan_type: 'basic', price: 0, yearly_price: null, currency: 'KES', description: '',
                max_users: 10, max_kpis: 50, max_departments: 10, max_storage_mb: 100,
                custom_branding: false, api_access: false, sso_enabled: false, advanced_analytics: false,
                priority_support: false, display_order: 0, is_active: true
            });
        }
    }, [plan, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        try {
            const payload = {
                ...formData,
                price: Math.round((parseFloat(formData.price) || 0) * 100),
                yearly_price: formData.yearly_price ? Math.round((parseFloat(formData.yearly_price) || 0) * 100) : null,
            };
            if (plan) await updatePlan(plan.id, payload);
            else await addPlan(payload);
            onSuccess();
            onClose();
        } catch (err) { setLocalError(err.message || 'Failed to save plan'); }
    };

    if (!isOpen) return null;

    return (
        <div className="plan-modal-overlay">
            <div className="plan-modal">
                <div className="plan-modal-header"><h3>{plan ? 'Edit Plan' : 'Create New Plan'}</h3><button onClick={onClose}><FiX /></button></div>
                <form onSubmit={handleSubmit}>
                    <div className="plan-modal-body">
                        {(localError || error) && <div className="plan-error"><FiAlertCircle /> {localError || error}</div>}
                        <div className="form-row"><div className="form-group"><label>Plan Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div><div className="form-group"><label>Plan Type</label><select value={formData.plan_type} onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}><option value="trial">Trial</option><option value="basic">Basic</option><option value="professional">Professional</option><option value="enterprise">Enterprise</option></select></div></div>
                        <div className="form-row"><div className="form-group"><label>Monthly Price</label><input type="number" step="any" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} /></div><div className="form-group"><label>Yearly Price</label><input type="number" step="any" value={formData.yearly_price || ''} onChange={(e) => setFormData({ ...formData, yearly_price: e.target.value })} /></div><div className="form-group"><label>Currency</label><select value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })}><option value="KES">KES</option><option value="USD">USD</option><option value="NGN">NGN</option><option value="GHS">GHS</option><option value="ZAR">ZAR</option></select></div></div>
                        <div className="form-row"><div className="form-group"><label>Max Users (-1 for unlimited)</label><input type="number" value={formData.max_users} onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) || 0 })} /></div><div className="form-group"><label>Max KPIs (-1 for unlimited)</label><input type="number" value={formData.max_kpis} onChange={(e) => setFormData({ ...formData, max_kpis: parseInt(e.target.value) || 0 })} /></div></div>
                        <div className="form-row"><div className="form-group"><label>Max Departments</label><input type="number" value={formData.max_departments} onChange={(e) => setFormData({ ...formData, max_departments: parseInt(e.target.value) || 0 })} /></div><div className="form-group"><label>Max Storage (MB)</label><input type="number" value={formData.max_storage_mb} onChange={(e) => setFormData({ ...formData, max_storage_mb: parseInt(e.target.value) || 0 })} /></div></div>
                        <div className="form-row"><label className="checkbox-label"><input type="checkbox" checked={formData.custom_branding} onChange={(e) => setFormData({ ...formData, custom_branding: e.target.checked })} /> Custom Branding</label><label className="checkbox-label"><input type="checkbox" checked={formData.api_access} onChange={(e) => setFormData({ ...formData, api_access: e.target.checked })} /> API Access</label><label className="checkbox-label"><input type="checkbox" checked={formData.sso_enabled} onChange={(e) => setFormData({ ...formData, sso_enabled: e.target.checked })} /> SSO Enabled</label><label className="checkbox-label"><input type="checkbox" checked={formData.advanced_analytics} onChange={(e) => setFormData({ ...formData, advanced_analytics: e.target.checked })} /> Advanced Analytics</label><label className="checkbox-label"><input type="checkbox" checked={formData.priority_support} onChange={(e) => setFormData({ ...formData, priority_support: e.target.checked })} /> Priority Support</label><label className="checkbox-label"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} /> Active</label></div>
                        <div className="form-group"><label>Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" /></div>
                    </div>
                    <div className="plan-modal-footer"><button type="button" onClick={onClose}>Cancel</button><button type="submit" disabled={loading}><FiSave /> {loading ? 'Saving...' : 'Save Plan'}</button></div>
                </form>
            </div>
        </div>
    );
};

export default PlanFormModal;