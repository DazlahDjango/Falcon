import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuota, useQuotaLimits } from '../../../hooks/billing';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { Spinner } from '../../../components/common/UI';
import UsageChart from '../../../components/billing/UsageChart';
import QuotaUsageBar from '../../../components/billing/QuotaUsageBar';
import { FiArrowLeft, FiDownload, FiPrinter, FiCalendar } from 'react-icons/fi';

const mockHistoricalData = [
    { date: 'Week 1', api_calls: 3200, users: 48, kpis: 210, storage_mb: 8900 },
    { date: 'Week 2', api_calls: 3500, users: 50, kpis: 225, storage_mb: 9200 },
    { date: 'Week 3', api_calls: 3800, users: 52, kpis: 240, storage_mb: 9500 },
    { date: 'Week 4', api_calls: 4200, users: 55, kpis: 258, storage_mb: 10200 },
];
const UsageReport = () => {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });
    const [selectedMetric, setSelectedMetric] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    const { data: quotaStatus, isLoading } = useQuota();
    const { data: quotaLimits } = useQuotaLimits();
    const handleExport = async (format) => {
        setIsExporting(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsExporting(false);
        alert(`Export as ${format} would download here`);
    };
    const handlePrint = () => {
        window.print();
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    const metrics = ['api_calls', 'storage', 'users', 'kpis'];
    const displayMetrics = selectedMetric === 'all' ? metrics : [selectedMetric];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(BILLING_ROUTES.REPORTS)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Usage Report</h1>
                        <p className="text-gray-500 mt-1">Analyze resource consumption patterns</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FiPrinter className="w-4 h-4" />
                        Print
                    </button>
                    <button
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                        className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        <FiDownload className="w-4 h-4" />
                        {isExporting ? 'Exporting...' : 'Export CSV'}
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FiCalendar className="w-5 h-5 text-gray-400" />
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>
                    <select
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="all">All Metrics</option>
                        <option value="api_calls">API Calls</option>
                        <option value="users">Users</option>
                        <option value="kpis">KPIs</option>
                        <option value="storage">Storage</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Current Users</p>
                    <p className="text-2xl font-bold text-gray-900">{quotaStatus?.users?.current || 0}</p>
                    <p className="text-xs text-gray-400">of {quotaStatus?.users?.max || 0} limit</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Current KPIs</p>
                    <p className="text-2xl font-bold text-gray-900">{quotaStatus?.kpis?.current || 0}</p>
                    <p className="text-xs text-gray-400">of {quotaStatus?.kpis?.max || 0} limit</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {Math.round((quotaStatus?.storage?.current_mb || 0) / 1024 * 10) / 10} GB
                    </p>
                    <p className="text-xs text-gray-400">of {Math.round((quotaStatus?.storage?.max_mb || 0) / 1024 * 10) / 10} GB</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">API Calls Today</p>
                    <p className="text-2xl font-bold text-gray-900">{quotaStatus?.api_calls_today?.current || 0}</p>
                    <p className="text-xs text-gray-400">of {quotaStatus?.api_calls_today?.max || 0} limit</p>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
                <UsageChart
                    data={mockHistoricalData}
                    type="line"
                    metrics={displayMetrics}
                    height={350}
                />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Usage</h3>
                <div className="space-y-5">
                    <QuotaUsageBar
                        used={quotaStatus?.users?.current || 0}
                        total={quotaStatus?.users?.max || 1}
                        label="Users"
                        unit="users"
                    />
                    <QuotaUsageBar
                        used={quotaStatus?.kpis?.current || 0}
                        total={quotaStatus?.kpis?.max || 1}
                        label="KPIs"
                        unit="KPIs"
                    />
                    <QuotaUsageBar
                        used={Math.round((quotaStatus?.storage?.current_mb || 0) / 1024 * 10) / 10}
                        total={Math.round((quotaStatus?.storage?.max_mb || 0) / 1024 * 10) / 10}
                        label="Storage"
                        unit="GB"
                    />
                    <QuotaUsageBar
                        used={quotaStatus?.api_calls_today?.current || 0}
                        total={quotaStatus?.api_calls_today?.max || 1}
                        label="API Calls (Today)"
                        unit="calls"
                    />
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Weekly Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Week</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">API Calls</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Users</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">KPIs</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Storage (GB)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mockHistoricalData.map((week, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{week.date}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{week.api_calls.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{week.users}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{week.kpis}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{Math.round(week.storage_mb / 1024 * 10) / 10}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Usage Insights</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li>• API usage has increased by 31% over the last month</li>
                    <li>• User growth is steady at ~8% month-over-month</li>
                    <li>• Storage consumption is within expected parameters</li>
                    <li>• Consider upgrading your plan in the next 3 months based on current growth trends</li>
                </ul>
            </div>
        </div>
    );
};
export default UsageReport;