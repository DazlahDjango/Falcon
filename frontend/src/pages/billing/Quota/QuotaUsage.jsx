import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuota, useQuotaLimits, useRefreshQuota } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import QuotaGauge from '../../../components/billing/QuotaGauge';
import QuotaUsageBar from '../../../components/billing/QuotaUsageBar';
import UsageChart from '../../../components/billing/UsageChart';
import { Spinner } from '../../../components/common/UI';
import { ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const mockUsageHistory = [
    { date: 'Jan', api_calls: 8500, users: 42, kpis: 180, storage_mb: 5120 },
    { date: 'Feb', api_calls: 9200, users: 45, kpis: 195, storage_mb: 6200 },
    { date: 'Mar', api_calls: 10100, users: 48, kpis: 210, storage_mb: 7100 },
    { date: 'Apr', api_calls: 11500, users: 50, kpis: 225, storage_mb: 8200 },
    { date: 'May', api_calls: 12800, users: 52, kpis: 240, storage_mb: 9300 },
    { date: 'Jun', api_calls: 14200, users: 55, kpis: 258, storage_mb: 10200 },
];
const QuotaUsage = () => {
    const navigate = useNavigate();
    const [chartType, setChartType] = useState('line');
    const { data: quotaStatus, isLoading, refetch } = useQuota();
    const { data: quotaLimits } = useQuotaLimits();
    const refreshQuota = useRefreshQuota();
    const handleRefresh = async () => {
        await refreshQuota.mutateAsync();
        await refetch();
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
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(BILLING_ROUTES.QUOTA)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Usage Analytics</h1>
                        <p className="text-gray-500 mt-1">Detailed view of your resource consumption</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshQuota.isLoading}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    <ArrowPathIcon className={`w-4 h-4 ${refreshQuota.isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Usage Breakdown</h3>
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
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Usage History</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-3 py-1 text-sm rounded-lg ${
                                chartType === 'line' 
                                    ? 'bg-primary-600 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Line
                        </button>
                        <button
                            onClick={() => setChartType('area')}
                            className={`px-3 py-1 text-sm rounded-lg ${
                                chartType === 'area' 
                                    ? 'bg-primary-600 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Area
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            className={`px-3 py-1 text-sm rounded-lg ${
                                chartType === 'bar' 
                                    ? 'bg-primary-600 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            Bar
                        </button>
                    </div>
                </div>
                <UsageChart
                    data={mockUsageHistory}
                    type={chartType}
                    metrics={['api_calls', 'storage', 'users']}
                    height={350}
                />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API Usage Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Today's Usage</p>
                        <p className="text-xl font-bold text-gray-900">
                            {quotaStatus.api_calls_today?.current?.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-gray-400">
                            of {quotaStatus.api_calls_today?.max?.toLocaleString()} limit
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Remaining Today</p>
                        <p className="text-xl font-bold text-green-600">
                            {(quotaStatus.api_calls_today?.max - quotaStatus.api_calls_today?.current)?.toLocaleString() || 0}
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Reset Time</p>
                        <p className="text-xl font-bold text-gray-900">Midnight</p>
                        <p className="text-xs text-gray-400">Daily at 00:00 UTC</p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Current Usage</p>
                        <p className="text-xl font-bold text-gray-900">
                            {Math.round((quotaStatus.storage?.current_mb || 0) / 1024 * 10) / 10} GB
                        </p>
                        <p className="text-xs text-gray-400">
                            of {Math.round((quotaStatus.storage?.max_mb || 0) / 1024 * 10) / 10} GB
                        </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Remaining Storage</p>
                        <p className="text-xl font-bold text-green-600">
                            {Math.round(((quotaStatus.storage?.max_mb - quotaStatus.storage?.current_mb) / 1024) * 10) / 10} GB
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default QuotaUsage;