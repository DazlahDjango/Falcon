import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { ArrowLeftIcon, PencilIcon, TrashIcon, BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

const mockWebhook = {
    id: '1',
    name: 'Production Endpoint',
    url: 'https://api.example.com/webhooks/falcon',
    events: ['invoice.paid', 'invoice.payment_failed', 'customer.subscription.updated'],
    active: true,
    created_at: '2024-01-15T10:30:00Z',
    last_triggered: '2024-06-10T14:23:00Z',
    delivery_count: 234,
    success_rate: 99.5,
    recent_deliveries: [
        { id: 'evt_1', event: 'invoice.paid', status: 'success', timestamp: '2024-06-10T14:23:00Z' },
        { id: 'evt_2', event: 'invoice.payment_failed', status: 'success', timestamp: '2024-06-09T10:15:00Z' },
        { id: 'evt_3', event: 'customer.subscription.updated', status: 'failed', timestamp: '2024-06-08T09:30:00Z' },
    ],
};
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
const WebhookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [webhook, setWebhook] = useState(mockWebhook);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isRedelivering, setIsRedelivering] = useState(false);
    const [formData, setFormData] = useState({
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        active: webhook.active,
    });
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const handleSaveEdit = () => {
        setWebhook({ ...webhook, ...formData });
        setIsEditing(false);
    };
    const handleRedeliver = (eventId) => {
        setIsRedelivering(true);
        setTimeout(() => {
            setIsRedelivering(false);
        }, 1000);
    };
    const handleDelete = () => {
        setShowDeleteConfirm(false);
        navigate(BILLING_ROUTES.WEBHOOKS);
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(BILLING_ROUTES.WEBHOOKS)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        {isEditing ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="text-2xl font-bold border border-gray-300 rounded-lg px-3 py-1"
                                />
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-3 py-1 bg-primary-600 text-white rounded-lg text-sm"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: webhook.name,
                                            url: webhook.url,
                                            events: webhook.events,
                                            active: webhook.active,
                                        });
                                    }}
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">{webhook.name}</h1>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <p className="text-gray-500 mt-1">Webhook endpoint for receiving events</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Endpoint URL</p>
                        {isEditing ? (
                            <input
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 font-mono text-sm"
                            />
                        ) : (
                            <code className="text-sm font-mono text-gray-700 break-all">{webhook.url}</code>
                        )}
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        {isEditing ? (
                            <label className="flex items-center gap-2 mt-1">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="rounded border-gray-300 text-primary-600"
                                />
                                <span className="text-sm">Active</span>
                            </label>
                        ) : (
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                webhook.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                                {webhook.active ? 'Active' : 'Inactive'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscribed Events</h3>
                {isEditing ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {Object.entries(eventLabels).map(([value, label]) => (
                            <label key={value} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.events.includes(value)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFormData({ ...formData, events: [...formData.events, value] });
                                        } else {
                                            setFormData({ ...formData, events: formData.events.filter(v => v !== value) });
                                        }
                                    }}
                                    className="rounded border-gray-300 text-primary-600"
                                />
                                <span className="text-sm text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {webhook.events.map(event => (
                            <span key={event} className="px-2 py-1 bg-gray-100 rounded-lg text-sm text-gray-600">
                                {eventLabels[event] || event}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">{webhook.delivery_count}</p>
                        <p className="text-sm text-gray-500">Total Deliveries</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{webhook.success_rate}%</p>
                        <p className="text-sm text-gray-500">Success Rate</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-gray-900">{formatDate(webhook.created_at).split(',')[0]}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Last Triggered</p>
                        <p className="font-medium text-gray-900">{formatDate(webhook.last_triggered).split(',')[0]}</p>
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Deliveries</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Time</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Event</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {webhook.recent_deliveries.map((delivery) => (
                                <tr key={delivery.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {formatDate(delivery.timestamp)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-700">
                                        {eventLabels[delivery.event] || delivery.event}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            delivery.status === 'success' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {delivery.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {delivery.status === 'failed' && (
                                            <button
                                                onClick={() => handleRedeliver(delivery.id)}
                                                disabled={isRedelivering}
                                                className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 ml-auto"
                                            >
                                                <ArrowPathIcon className="w-4 h-4" />
                                                Redeliver
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>          
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Delete Webhook Endpoint"
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            >
                <p className="text-gray-600">
                    Are you sure you want to delete "{webhook.name}"? You will no longer receive events at this endpoint.
                </p>
            </ConfirmDialog>
        </div>
    );
};
export default WebhookDetail;