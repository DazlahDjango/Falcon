import React, { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { useEnterprise } from '../../../hooks/billing/useEnterprise';
import { usePlans } from '../../../hooks/billing/usePlans';
import { useOrganizations } from '../../../hooks/tenant/useOrganizations';
import './enterprise.css';

export const EnterpriseOverrideModal = ({ isOpen, onClose, override, onSuccess }) => {
    const { addOverride, updateOverride, loading } = useEnterprise();
    const { plans, fetchAllPlans } = usePlans({ autoFetch: true });
    const { organizations } = useOrganizations({ autoFetch: true });
    const [formData, setFormData] = useState({ tenantId: '', planId: '', customPriceMonthly: '', customPriceYearly: '', discountPercentage: '', validUntil: '', overrideFeatures: {} });

    useEffect(() => { if (isOpen && !plans.length) fetchAllPlans({}); }, [isOpen, plans.length, fetchAllPlans]);
    useEffect(() => { if (override) setFormData({ tenantId: override.tenant_id, planId: override.plan_id, customPriceMonthly: override.custom_price_monthly || '', customPriceYearly: override.custom_price_yearly || '', discountPercentage: override.discount_percentage || '', validUntil: override.valid_until?.split('T')[0] || '', overrideFeatures: override.override_features || {} }); else setFormData({ tenantId: '', planId: '', customPriceMonthly: '', customPriceYearly: '', discountPercentage: '', validUntil: '', overrideFeatures: {} }); }, [override, isOpen]);

    const handleSubmit = async (e) => { e.preventDefault(); try { if (override) await updateOverride(override.id, formData); else await addOverride(formData); onSuccess(); onClose(); } catch (err) { console.error(err); } };

    if (!isOpen) return null;

    return (<div className="enterprise-modal-overlay" onClick={onClose}><div className="enterprise-modal" onClick={(e) => e.stopPropagation()}><div className="enterprise-modal-header"><h3>{override ? 'Edit Tenant Override' : 'Create Tenant Override'}</h3><button onClick={onClose}><FiX /></button></div><form onSubmit={handleSubmit}><div className="enterprise-modal-body"><div className="form-group"><label>Organization</label><select value={formData.tenantId} onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })} required disabled={!!override}><option value="">Select Organization</option>{organizations.map(org => (<option key={org.id} value={org.id}>{org.name}</option>))}</select></div><div className="form-group"><label>Plan</label><select value={formData.planId} onChange={(e) => setFormData({ ...formData, planId: e.target.value })} required><option value="">Select Plan</option>{plans.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div><div className="form-row"><div className="form-group"><label>Custom Monthly Price (cents)</label><input type="number" value={formData.customPriceMonthly} onChange={(e) => setFormData({ ...formData, customPriceMonthly: e.target.value })} placeholder="Leave empty for default" /></div><div className="form-group"><label>Custom Yearly Price (cents)</label><input type="number" value={formData.customPriceYearly} onChange={(e) => setFormData({ ...formData, customPriceYearly: e.target.value })} placeholder="Leave empty for default" /></div></div><div className="form-row"><div className="form-group"><label>Discount Percentage</label><input type="number" step="0.01" min="0" max="100" value={formData.discountPercentage} onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })} placeholder="e.g., 15 for 15% off" /></div><div className="form-group"><label>Valid Until (Optional)</label><input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} /></div></div><div className="form-group"><label>Override Features (JSON)</label><textarea rows={4} value={JSON.stringify(formData.overrideFeatures, null, 2)} onChange={(e) => { try { setFormData({ ...formData, overrideFeatures: JSON.parse(e.target.value) }); } catch { } }} placeholder='{"max_users": 1000, "max_kpis": 5000}' /></div></div><div className="enterprise-modal-footer"><button type="button" onClick={onClose}>Cancel</button><button type="submit" disabled={loading}><FiSave /> {loading ? 'Saving...' : 'Save Override'}</button></div></form></div></div>);
};

export default EnterpriseOverrideModal;