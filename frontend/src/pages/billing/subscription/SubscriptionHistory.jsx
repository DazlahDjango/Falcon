import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionHistory, useCurrentSubscription } from '../../../hooks/billing';
import { Spinner } from '../../../components/common/UI';
import { FiArrowLeft, FiClock, FiFileText } from 'react-icons/fi';

const SubscriptionHistory = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { data: subscription, isLoading: subLoading } = useCurrentSubscription();
    const { data: history, isLoading: historyLoading } = useSubscriptionHistory(subscription?.id);
    const isLoading = subLoading || historyLoading;
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }
    if (!subscription) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No active subscription found.</p>
                <button
                    onClick={() => navigate('/app/billing/plans')}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
                >
                    View Plans
                </button>
            </div>
        );
    }
    const historyList = history || [];
    const itemsPerPage = 20;
    const totalPages = Math.ceil(historyList.length / itemsPerPage);
    const paginatedHistory = historyList.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/app/billing/subscription/current')}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Subscription History</h1>
                    <p className="text-gray-500 mt-1">View all changes made to your subscription</p>
                </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-blue-800">Current Plan</p>
                        <p className="font-semibold text-blue-900">{subscription.plan?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-blue-800">Status</p>
                        <p className="font-semibold text-blue-900 capitalize">{subscription.status}</p>
                    </div>
                    <div>
                        <p className="text-sm text-blue-800">Since</p>
                        <p className="font-semibold text-blue-900">{formatDate(subscription.current_period_start)}</p>
                    </div>
                </div>
            </div>
            {historyList.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <FiClock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No History Records</h3>
                    <p className="text-gray-500">No subscription changes have been recorded yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Change Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Previous
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        New
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reason
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedHistory.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(record.created_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${record.new_status === 'active' ? 'bg-green-100 text-green-800' :
                                                    record.new_status === 'canceled' ? 'bg-red-100 text-red-800' :
                                                        record.previous_plan !== record.new_plan ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}>
                                                {record.previous_plan !== record.new_plan ? 'Plan Change' : 'Status Change'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {record.previous_plan_name || record.previous_status || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {record.new_plan_name || record.new_status || '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {record.change_reason || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                Showing {(page - 1) * itemsPerPage + 1} to {Math.min(page * itemsPerPage, historyList.length)} of {historyList.length} records
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm text-gray-600">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default SubscriptionHistory;