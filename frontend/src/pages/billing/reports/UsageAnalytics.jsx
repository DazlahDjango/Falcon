// frontend/src/pages/billing/UsageAnalytics.jsx
/**
 * Usage Analytics Page
 * Advanced analytics for resource usage with insights
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuota } from '../../../hooks/billing/useQuota';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import UsageChart from '../../../components/billing/UsageChart';
import { Spinner } from '../../../components/common/UI';
import { ArrowLeftIcon, TrendUpIcon, TrendDownIcon } from '@heroicons/react/24/outline';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const mockTrendData = {
    users: { trend: 'up', percentage: 12, insight: 'User growth is steady. Consider upgrading if this trend continues.' },
    kpis: { trend: 'up', percentage: 8, insight: 'KPI creation is increasing. Plan limits are sufficient for now.' },
    apiCalls: { trend: 'up', percentage: 25, insight: 'API usage is growing rapidly. Monitor your daily limits.' },
    storage: { trend: 'up', percentage: 15, insight: 'Storage consumption is increasing steadily.' },
};
const mockPredictions = [
    { metric: 'Users', current: 55, predicted: 68, nextMonth: 72, confidence: 85 },
    { metric: 'KPIs', current: 258, predicted: 310, nextMonth: 330, confidence: 80 },
    { metric: 'API Calls', current: 14200, predicted: 18500, nextMonth: 21000, confidence: 75 },
    { metric: 'Storage (GB)', current: 10.2, predicted: 13.5, nextMonth: 15.2, confidence: 82 },
];
const mockUsageHistory = [
    { date: 'Jan', api_calls: 8500, users: 42, kpis: 180, storage_mb: 5120 },
    { date: 'Feb', api_calls: 9200, users: 45, kpis: 195, storage_mb: 6200 },
    { date: 'Mar', api_calls: 10100, users: 48, kpis: 210, storage_mb: 7100 },
    { date: 'Apr', api_calls: 11500, users: 50, kpis: 225, storage_mb: 8200 },
    { date: 'May', api_calls: 12800, users: 52, kpis: 240, storage_mb: 9300 },
    { date: 'Jun', api_calls: 14200, users: 55, kpis: 258, storage_mb: 10200 },
    { date: 'Jul', api_calls: 0, users: 0, kpis: 0, storage_mb: 0 },
    { date: 'Aug', api_calls: 0, users: 0, kpis: 0, storage_mb: 0 },
    { date: 'Sep', api_calls: 0, users: 0, kpis: 0, storage_mb: 0 },
];
const UsageAnalytics = () => {
    const navigate = useNavigate();
    const [timeframe, setTimeframe] = useState('6months');
    const { data: quotaStatus, isLoading } = useQuota();
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    const getFilteredData = () => {
        const monthMap = { '3months': 3, '6months': 6, '12months': 12 };
        const monthsToShow = monthMap[timeframe] || 6;
        return mockUsageHistory.slice(-monthsToShow);
    };
    const filteredData = getFilteredData();
    
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
                        <p className="text-gray-500 mt-1">AI-powered insights and predictions for your resource usage</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeframe('3months')}
                        className={`px-3 py-1 text-sm rounded-lg ${
                            timeframe === '3months' 
                                ? 'bg-primary-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        3 Months
                    </button>
                    <button
                        onClick={() => setTimeframe('6months')}
                        className={`px-3 py-1 text-sm rounded-lg ${
                            timeframe === '6months' 
                                ? 'bg-primary-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        6 Months
                    </button>
                    <button
                        onClick={() => setTimeframe('12months')}
                        className={`px-3 py-1 text-sm rounded-lg ${
                            timeframe === '12months' 
                                ? 'bg-primary-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        12 Months
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">Users</p>
                            <p className="text-2xl font-bold text-gray-900">{mockTrendData.users.trend === 'up' ? '↑' : '↓'} {mockTrendData.users.percentage}%</p>
                        </div>
                        <div className={`p-2 rounded-lg ${mockTrendData.users.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {mockTrendData.users.trend === 'up' ? (
                                <TrendUpIcon className="w-5 h-5 text-green-600" />
                            ) : (
                                <TrendDownIcon className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{mockTrendData.users.insight}</p>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">KPIs</p>
                            <p className="text-2xl font-bold text-gray-900">{mockTrendData.kpis.trend === 'up' ? '↑' : '↓'} {mockTrendData.kpis.percentage}%</p>
                        </div>
                        <div className={`p-2 rounded-lg ${mockTrendData.kpis.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {mockTrendData.kpis.trend === 'up' ? (
                                <TrendUpIcon className="w-5 h-5 text-green-600" />
                            ) : (
                                <TrendDownIcon className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{mockTrendData.kpis.insight}</p>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">API Calls</p>
                            <p className="text-2xl font-bold text-gray-900">{mockTrendData.apiCalls.trend === 'up' ? '↑' : '↓'} {mockTrendData.apiCalls.percentage}%</p>
                        </div>
                        <div className={`p-2 rounded-lg ${mockTrendData.apiCalls.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {mockTrendData.apiCalls.trend === 'up' ? (
                                <TrendUpIcon className="w-5 h-5 text-green-600" />
                            ) : (
                                <TrendDownIcon className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{mockTrendData.apiCalls.insight}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500">Storage</p>
                            <p className="text-2xl font-bold text-gray-900">{mockTrendData.storage.trend === 'up' ? '↑' : '↓'} {mockTrendData.storage.percentage}%</p>
                        </div>
                        <div className={`p-2 rounded-lg ${mockTrendData.storage.trend === 'up' ? 'bg-green-100' : 'bg-red-100'}`}>
                            {mockTrendData.storage.trend === 'up' ? (
                                <TrendUpIcon className="w-5 h-5 text-green-600" />
                            ) : (
                                <TrendDownIcon className="w-5 h-5 text-red-600" />
                            )}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{mockTrendData.storage.insight}</p>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
                <UsageChart
                    data={filteredData}
                    type="line"
                    metrics={['api_calls', 'users', 'kpis']}
                    height={350}
                />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Predictions</h3>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Beta</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    Based on your usage patterns over the last 6 months, here are our predictions for the next 30 days.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mockPredictions.map((pred, idx) => (
                        <div key={idx} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
                            <p className="text-sm text-gray-600">{pred.metric}</p>
                            <div className="mt-2">
                                <p className="text-xs text-gray-400">Current</p>
                                <p className="text-xl font-bold text-gray-900">{pred.current.toLocaleString()}</p>
                            </div>
                            <div className="mt-2">
                                <p className="text-xs text-gray-400">Predicted (30 days)</p>
                                <p className="text-lg font-semibold text-purple-700">{pred.predicted.toLocaleString()}</p>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                                <p className="text-xs text-gray-400">Next Month</p>
                                <p className="text-sm font-medium text-indigo-600">{pred.nextMonth.toLocaleString()}</p>
                            </div>
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div 
                                        className="bg-purple-600 rounded-full h-1"
                                        style={{ width: `${pred.confidence}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Confidence: {pred.confidence}%</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800">
                        💡 Insight: At current growth rates, you may reach your API call limit in 45 days. Consider upgrading to avoid service interruption.
                    </p>
                </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Recommendation</h3>
                <p className="text-sm text-blue-800">
                    Based on your usage patterns and predicted growth, we recommend reviewing your plan limits.
                    The Professional plan would provide you with 2x the resources at only 40% more cost.
                </p>
                <button
                    onClick={() => navigate(BILLING_ROUTES.PLANS)}
                    className="mt-3 text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                    View Upgrade Options →
                </button>
            </div>
        </div>
    );
};
export default UsageAnalytics;