import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { FiArrowLeft, FiRefreshCw, FiEye } from 'react-icons/fi';

const mockLogs = Array.from({ length: 25 }, (_, i) => ({
    id: `log_${i}`,
    event: ['invoice.paid', 'invoice.payment_failed', 'customer.subscription.updated'][Math.floor(Math.random() * 3)],
    status: Math.random() > 0.9 ? 'failed' : 'success',
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    response_code: Math.random() > 0.9 ? 500 : 200,
    response_body: '{"status":"ok"}',
    duration_ms: Math.floor(Math.random() * 500) + 50,
}));
const eventLabels = {
    'customer.subscription.created': 'Subscription Created',
    'customer.subscription.updated': 'Subscription Updated',
    'customer.subscription.deleted': 'Subscription Deleted',
    'customer.subscription.trial_will_end': 'Trial Will End',
    'invoice.paid': 'Invoice Paid',
    'invoice.payment_failed': 'Payment Failed',
    'payment_intent.succeeded': 'Payment Succeeded',
    'payment_intent.payment_failed': 'Payment Failed',
};

const WebhookLogs = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [logs, setLogs] = useState(mockLogs);
    const [filter, setFilter] = useState('all');
    const [selectedLog, setSelectedLog] = useState(null);
    const filteredLogs = filter === 'all' ? logs : logs.filter(l => l.status === filter);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };
    const handleRedeliver = (logId) => {
        console.log('Redeliver:', logId);
    };
    
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(BILLING_ROUTES.WEBHOOK_DETAIL(id))}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Webhook Delivery Logs</h1>
                    <p className="text-gray-500 mt-1">View all webhook delivery attempts</p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        filter === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('success')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        filter === 'success'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Success
                </button>
                <button
                    onClick={() => setFilter('failed')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        filter === 'failed'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Failed
                </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(log.timestamp)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {eventLabels[log.event] || log.event}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            log.status === 'success'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={log.response_code === 200 ? 'text-green-600' : 'text-red-600'}>
                                            HTTP {log.response_code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {log.duration_ms}ms
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="text-gray-400 hover:text-gray-600"
                                                title="View Details"
                                            >
                                                <FiEye className="w-5 h-5" />
                                            </button>
                                            {log.status === 'failed' && (
                                                <button
                                                    onClick={() => handleRedeliver(log.id)}
                                                    className="text-primary-600 hover:text-primary-700"
                                                    title="Redeliver"
                                                >
                                                    <FiRefreshCw className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedLog && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setSelectedLog(null)} />
                        <div className="relative bg-white rounded-xl max-w-2xl w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium">{formatDate(selectedLog.timestamp)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Event</p>
                                    <p className="font-medium">{eventLabels[selectedLog.event] || selectedLog.event}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <p className={`font-medium ${selectedLog.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedLog.status.toUpperCase()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Response</p>
                                    <pre className="mt-1 p-3 bg-gray-100 rounded-lg text-sm overflow-x-auto">
                                        {selectedLog.response_body}
                                    </pre>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Close
                                </button>
                                {selectedLog.status === 'failed' && (
                                    <button
                                        onClick={() => {
                                            handleRedeliver(selectedLog.id);
                                            setSelectedLog(null);
                                        }}
                                        className="ml-3 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        Redeliver
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default WebhookLogs;