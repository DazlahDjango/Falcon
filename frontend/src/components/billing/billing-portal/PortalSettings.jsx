import React, { useState } from 'react';
import { FiBell, FiRefreshCw, FiMail, FiShield, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { BillingCard } from '../shared/BillingCard';
import { LoadingSkeleton } from '../shared/LoadingSkeleton';
import { useSubscription } from '../../../hooks/billing/useSubscription';
import './billing-portal.css';

export const PortalSettings = ({ subscription, onUpdate }) => {
    const { updateSubscriptionSettings, loading } = useSubscription();
    const [autoRenew, setAutoRenew] = useState(subscription?.auto_renew || false);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleAutoRenewChange = async (e) => {
        const newValue = e.target.checked;
        setAutoRenew(newValue);
        setSaving(true);
        setSaveSuccess(false);
        try {
            await updateSubscriptionSettings(subscription?.id, newValue);
            if (onUpdate) onUpdate();
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) { setAutoRenew(!newValue); }
        finally { setSaving(false); }
    };

    if (!subscription) return <LoadingSkeleton type="card" count={1} />;

    return (
        <div className="portal-settings">
            <BillingCard title="Notification Preferences" icon={<FiBell />}>
                <div className="settings-group">
                    <label className="settings-toggle"><input type="checkbox" defaultChecked /> <span>Email me about billing updates</span></label>
                    <label className="settings-toggle"><input type="checkbox" defaultChecked /> <span>Send invoice reminders</span></label>
                    <label className="settings-toggle"><input type="checkbox" defaultChecked /> <span>Notify me before subscription renews</span></label>
                    <label className="settings-toggle"><input type="checkbox" /> <span>Send payment confirmation emails</span></label>
                </div>
            </BillingCard>

            <BillingCard title="Billing Settings" icon={<FiMail />}>
                <div className="settings-group">
                    <label className="settings-toggle"><input type="checkbox" checked={autoRenew} onChange={handleAutoRenewChange} disabled={saving} /> <span>Auto-renew subscription</span> <span className="toggle-note">Your subscription will automatically renew each billing cycle</span></label>
                    {saveSuccess && <div className="save-success"><FiCheckCircle /> Settings saved successfully</div>}
                    {saving && <div className="save-loading"><FiRefreshCw className="spin" /> Saving...</div>}
                </div>
            </BillingCard>

            <BillingCard title="Security" icon={<FiShield />}>
                <div className="settings-group">
                    <div className="security-info"><FiAlertCircle /> Your payment information is protected with PCI DSS Level 1 compliance</div>
                    <div className="security-info"><FiShield /> All transactions are encrypted using TLS 1.3</div>
                    <button className="security-action" onClick={() => window.location.href = '/security/billing'}>View Security Details</button>
                </div>
            </BillingCard>
        </div>
    );
};

export default PortalSettings;