import React from 'react';
import { BillingShell } from '../../components/billing/common/BillingShell';
import { BillingCard } from '../../components/billing/shared/BillingCard';
import { useBillingSystemSettings } from '../../hooks/billing/useBillingSystemSettings';
import { useBillingPermissions } from '../../hooks/billing/useBillingPermissions';
import { LoadingSkeleton } from '../../components/billing/shared/LoadingSkeleton';
import { EmptyState } from '../../components/billing/shared/EmptyState';
import { FiSettings, FiDollarSign, FiPercent, FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import './platform-settings.css';

const BillingPlatformSettingsPage = () => {
    const { permissions } = useBillingPermissions();
    const { settings, loading, update, reset, canManage } = useBillingSystemSettings({ autoFetch: true });

    if (!permissions.canAccessAdminPanel) {
        return <EmptyState type="default" title="Access Denied" message="You don't have permission to access billing settings." />;
    }

    if (loading) return <LoadingSkeleton type="card" count={3} />;

    const handleTaxRateChange = async (country, rate) => {
        const taxRates = { ...settings?.tax_rates, [country]: parseFloat(rate) };
        await update({ tax_rates: taxRates });
    };

    const handleSettingChange = async (key, value) => {
        await update({ [key]: value });
    };

    const taxCountries = [
        { code: 'KE', name: 'Kenya', rate: settings?.tax_rates?.KE || 16 },
        { code: 'NG', name: 'Nigeria', rate: settings?.tax_rates?.NG || 7.5 },
        { code: 'GH', name: 'Ghana', rate: settings?.tax_rates?.GH || 12.5 },
        { code: 'ZA', name: 'South Africa', rate: settings?.tax_rates?.ZA || 15 },
        { code: 'CI', name: 'Ivory Coast', rate: settings?.tax_rates?.CI || 18 },
    ];

    return (
        <BillingShell title="Platform Settings" subtitle="Configure global billing platform settings">
            <div className="platform-settings-grid">
                <BillingCard title="Tax Rates" icon={<FiPercent />}>
                    <div className="platform-settings-section">
                        {taxCountries.map(country => (
                            <div key={country.code} className="platform-setting-row">
                                <span className="platform-setting-label">{country.name}</span>
                                <div className="tax-rate-group">
                                    <input 
                                        type="number" 
                                        step="0.1" 
                                        value={country.rate} 
                                        onChange={(e) => handleTaxRateChange(country.code, e.target.value)} 
                                        disabled={!canManage} 
                                        className="platform-setting-input" 
                                    />
                                    <span className="tax-rate-percent">%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </BillingCard>

                <BillingCard title="Grace Period Settings" icon={<FiClock />}>
                    <div className="platform-settings-section">
                        <div className="platform-setting-row">
                            <span className="platform-setting-label">Grace Period Days</span>
                            <input 
                                type="number" 
                                value={settings?.grace_period_days || 7} 
                                onChange={(e) => handleSettingChange('grace_period_days', parseInt(e.target.value))} 
                                disabled={!canManage} 
                                className="platform-setting-input" 
                            />
                        </div>
                        <div className="platform-setting-row">
                            <span className="platform-setting-label">Suspension Days</span>
                            <input 
                                type="number" 
                                value={settings?.suspension_days || 30} 
                                onChange={(e) => handleSettingChange('suspension_days', parseInt(e.target.value))} 
                                disabled={!canManage} 
                                className="platform-setting-input" 
                            />
                        </div>
                        <div className="platform-setting-row">
                            <span className="platform-setting-label">Payment Retry Attempts</span>
                            <input 
                                type="number" 
                                value={settings?.payment_retry_attempts || 3} 
                                onChange={(e) => handleSettingChange('payment_retry_attempts', parseInt(e.target.value))} 
                                disabled={!canManage} 
                                className="platform-setting-input" 
                            />
                        </div>
                    </div>
                </BillingCard>

                {/* Add similar for other sections... */}
            </div>
        </BillingShell>
    );
};

export default BillingPlatformSettingsPage;