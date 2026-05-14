import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuota, useQuotaLimits, useRefreshQuota, useCurrentSubscription } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import QuotaGauge from '../../../components/billing/QuotaGauge';
import QuotaUsageBar from '../../../components/billing/QuotaUsageBar';
import UsageChart from '../../../components/billing/UsageChart';
import { Spinner } from '../../../components/common/UI';
import { FiRefreshCw, FiArrowUp } from 'react-icons/fi';

const mockUsageHistory = [
    { date: '2024-01', api_calls: 8500, users: 42, kpis: 180, storage_mb: 5120 },
    { date: '2024-02', api_calls: 9200, users: 45, kpis: 195, storage_mb: 6200 },
    { date: '2024-03', api_calls: 10100, users: 48, kpis: 210, storage_mb: 7100 },
    { date: '2024-04', api_calls: 11500, users: 50, kpis: 225, storage_mb: 8200 },
    { date: '2024-05', api_calls: 12800, users: 52, kpis: 240, storage_mb: 9300 },
    { date: '2024-06', api_calls: 14200, users: 55, kpis: 258, storage_mb: 10200 },
];
const QuotaStatus = () => {
    const navigate = useNavigate();
    const { data: quotaStatus, isLoading, refetch } = useQuota();
    const { data: quotaLimits } = useQuotaLimits();
    const { data: subscription } = useCurrentSubscription();
    const refreshQuota = useRefreshQuota();
    const handleRefresh = async () => {
        await refreshQuota.mutateAsync();
        await refetch();
    };
    const handleUpgrade = () => {
        navigate(BILLING_ROUTES.SUBSCRIPTION_UPGRADE);
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    if (!quotaStatus) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No quota information available.</p>
            </div>
        );
    }
    const currentPlan = subscription?.plan?.name || 'Current Plan';
    const hasWarnings = quotaStatus.users?.percentage > 80 || quotaStatus.kpis?.percentage > 80 || quotaStatus.storage?.percentage > 80;
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Usage & Quotas</h1>
                    <p className="text-gray-500 mt-1">
                        Monitor your resource usage against plan limits - {currentPlan}
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshQuota.isLoading}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <FiRefreshCw className={`w-4 h-4 ${refreshQuota.isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>
            {hasWarnings && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex justify-between items-center">
                    <div>
                        <p className="text-sm font-medium text-amber-800">You're approaching your usage limits</p>
                        <p className="text-xs text-amber-700 mt-1">Upgrade your plan to unlock higher limits</p>
                    </div>
                    <button
                        onClick={handleUpgrade}
                        className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 flex items-center gap-2"
                    >
                        <FiArrowUp className="w-4 h-4" />
                        Upgrade Plan
                    </button>
                </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <QuotaGauge
                        used={quotaStatus.users?.current || 0}
                        total={quotaStatus.users?.max || 1}
                        label="Users"
                        size="md"
                    />
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <QuotaGauge
                        used={quotaStatus.kpis?.current || 0}
                        total={quotaStatus.kpis?.max || 1}
                        label="KPIs"
                        size="md"
                    />
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <QuotaGauge
                        used={Math.round((quotaStatus.storage?.current_mb || 0) / 1024 * 10) / 10}
                        total={Math.round((quotaStatus.storage?.max_mb || 0) / 1024 * 10) / 10}
                        label="Storage (GB)"
                        size="md"
                        unit="GB"
                    />
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <QuotaGauge
                        used={quotaStatus.api_calls_today?.current || 0}
                        total={quotaStatus.api_calls_today?.max || 1}
                        label="API Calls / Day"
                        size="md"
                    />
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Usage</h3>
                <div className="space-y-5">
                    <QuotaUsageBar
                        used={quotaStatus.users?.current || 0}
                        total={quotaStatus.users?.max || 1}
                        label="Users"
                        unit="users"
                    />
                    <QuotaUsageBar
                        used={quotaStatus.admins?.current || 0}
                        total={quotaStatus.admins?.max || 1}
                        label="Admins"
                        unit="admins"
                    />
                    <QuotaUsageBar
                        used={quotaStatus.kpis?.current || 0}
                        total={quotaStatus.kpis?.max || 1}
                        label="KPIs"
                        unit="KPIs"
                    />
                    <QuotaUsageBar
                        used={Math.round((quotaStatus.storage?.current_mb || 0) / 1024 * 10) / 10}
                        total={Math.round((quotaStatus.storage?.max_mb || 0) / 1024 * 10) / 10}
                        label="Storage"
                        unit="GB"
                    />
                    <QuotaUsageBar
                        used={quotaStatus.api_calls_today?.current || 0}
                        total={quotaStatus.api_calls_today?.max || 1}
                        label="API Calls (Today)"
                        unit="calls"
                    />
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Custom Branding</span>
                        <span className={`text-sm font-medium ${quotaStatus.features?.custom_branding ? 'text-green-600' : 'text-gray-400'}`}>
                            {quotaStatus.features?.custom_branding ? '✓ Available' : '—'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">API Access</span>
                        <span className={`text-sm font-medium ${quotaStatus.features?.api_access ? 'text-green-600' : 'text-gray-400'}`}>
                            {quotaStatus.features?.api_access ? '✓ Available' : '—'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">SSO Integration</span>
                        <span className={`text-sm font-medium ${quotaStatus.features?.sso ? 'text-green-600' : 'text-gray-400'}`}>
                            {quotaStatus.features?.sso ? '✓ Available' : '—'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Advanced Analytics</span>
                        <span className={`text-sm font-medium ${quotaStatus.features?.advanced_analytics ? 'text-green-600' : 'text-gray-400'}`}>
                            {quotaStatus.features?.advanced_analytics ? '✓ Available' : '—'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Audit Logs</span>
                        <span className={`text-sm font-medium ${quotaStatus.features?.audit_logs ? 'text-green-600' : 'text-gray-400'}`}>
                            {quotaStatus.features?.audit_logs ? '✓ Available' : '—'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Data Export</span>
                        <span className={`text-sm font-medium ${quotaStatus.features?.export ? 'text-green-600' : 'text-gray-400'}`}>
                            {quotaStatus.features?.export ? '✓ Available' : '—'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage History</h3>
                <UsageChart
                    data={mockUsageHistory}
                    type="line"
                    metrics={['api_calls', 'storage', 'users']}
                    height={350}
                />
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center text-sm text-gray-500">
                <p>
                    Limits reset based on your billing cycle. 
                    Need higher limits? <button onClick={handleUpgrade} className="text-primary-600 hover:underline">Contact us</button> to discuss custom plans.
                </p>
            </div>
        </div>
    );
};
export default QuotaStatus;