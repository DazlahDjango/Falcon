import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { FiPlus, FiActivity, FiTrash2, FiEdit, FiBell } from 'react-icons/fi';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const mockWebhooks = [
    { 
        id: '1', 
        name: 'Production Endpoint', 
        url: 'https://api.example.com/webhooks/falcon',
        events: ['invoice.paid', 'invoice.payment_failed', 'customer.subscription.updated'],
        active: true,
        created_at: '2024-01-15',
        last_triggered: '2024-06-10',
        delivery_count: 234,
        success_rate: 99.5,
    },
    { 
        id: '2', 
        name: 'Staging Endpoint', 
        url: 'https://staging.example.com/webhooks/falcon',
        events: ['invoice.paid', 'customer.subscription.updated', 'payment_intent.succeeded'],
        active: true,
        created_at: '2024-02-20',
        last_triggered: '2024-06-09',
        delivery_count: 45,
        success_rate: 98.2,
    },
];
const WebhookList = () => {
    const navigate = useNavigate();
    const [webhooks, setWebhooks] = useState(mockWebhooks);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const handleDelete = () => {
        if (deleteTarget) {
            setWebhooks(webhooks.filter(w => w.id !== deleteTarget));
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
        }
    };
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
                    <p className="text-gray-500 mt-1">Configure webhook endpoints to receive real-time events</p>
                </div>
                <button
                    onClick={() => navigate(BILLING_ROUTES.WEBHOOK_CREATE)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <FiPlus className="w-5 h-5" />
                    Add Endpoint
                </button>
            </div>
            {webhooks.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <FiActivity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Webhook Endpoints</h3>
                    <p className="text-gray-500 mb-4">Create your first webhook endpoint to start receiving events.</p>
                    <button
                        onClick={() => navigate(BILLING_ROUTES.WEBHOOK_CREATE)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Add Webhook Endpoint
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint URL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Triggered</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {webhooks.map((webhook) => (
                                <tr key={webhook.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-gray-900">{webhook.name}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                        {webhook.url.substring(0, 40)}...
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            webhook.active 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {webhook.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(webhook.last_triggered)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(BILLING_ROUTES.WEBHOOK_DETAIL(webhook.id))}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <FiBell className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => navigate(BILLING_ROUTES.WEBHOOK_DETAIL(webhook.id))}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <FiEdit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setDeleteTarget(webhook.id);
                                                    setShowDeleteConfirm(true);
                                                }}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FiTrash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                     </td>
                                 </tr>
                            ))}
                        </tbody>
                     </table>
                </div>
            )}
            <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                    📚 Need help setting up webhooks? Check out our <a href="/docs/webhooks" className="text-blue-700 font-medium hover:underline">Webhook Documentation</a>
                </p>
            </div>
            
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTarget(null);
                }}
                onConfirm={handleDelete}
                title="Delete Webhook Endpoint"
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            >
                <p className="text-gray-600">
                    Are you sure you want to delete this webhook endpoint? You will no longer receive events at this URL.
                </p>
            </ConfirmDialog>
        </div>
    );
};
export default WebhookList;