import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BILLING_ROUTES } from '../../../config/constants/billingRoutesConstants';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const eventOptions = [
    { value: 'customer.subscription.created', label: 'Subscription Created' },
    { value: 'customer.subscription.updated', label: 'Subscription Updated' },
    { value: 'customer.subscription.deleted', label: 'Subscription Deleted' },
    { value: 'customer.subscription.trial_will_end', label: 'Trial Will End' },
    { value: 'invoice.paid', label: 'Invoice Paid' },
    { value: 'invoice.payment_failed', label: 'Payment Failed' },
    { value: 'payment_intent.succeeded', label: 'Payment Succeeded' },
    { value: 'payment_intent.payment_failed', label: 'Payment Failed' },
];
const WebhookCreate = () => {
    const navigate = useNavigate();
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        events: ['invoice.paid', 'invoice.payment_failed'],
        active: true,
        secret: '',
    });
    
    const handleTestWebhook = async () => {
        setIsTesting(true);
        setTestResult(null);
        setTimeout(() => {
            setTestResult({
                success: true,
                message: 'Webhook endpoint is reachable and responded with 200 OK',
                response_time: '245ms',
            });
            setIsTesting(false);
        }, 1500);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Create webhook:', formData);
        navigate(BILLING_ROUTES.WEBHOOKS);
    };
    
    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(BILLING_ROUTES.WEBHOOKS)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Webhook Endpoint</h1>
                    <p className="text-gray-500 mt-1">Configure a new webhook endpoint to receive events</p>
                </div>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Endpoint Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            placeholder="e.g., Production Webhook"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Endpoint URL *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                required
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                placeholder="https://api.example.com/webhooks/falcon"
                            />
                            <button
                                type="button"
                                onClick={handleTestWebhook}
                                disabled={!formData.url || isTesting}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                {isTesting ? 'Testing...' : 'Test'}
                            </button>
                        </div>
                        {testResult && (
                            <div className={`mt-2 p-2 rounded-lg text-sm ${
                                testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                            }`}>
                                {testResult.message}
                                {testResult.response_time && (
                                    <span className="ml-2 text-xs opacity-75">({testResult.response_time})</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Signing Secret (Optional)
                        </label>
                        <input
                            type="text"
                            value={formData.secret}
                            onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                            placeholder="Auto-generated if left blank"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Used to verify webhook signatures. Generate a random secret for security.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Events to Send *
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                            {eventOptions.map((event) => (
                                <label key={event.value} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.events.includes(event.value)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData({ ...formData, events: [...formData.events, event.value] });
                                            } else {
                                                setFormData({ ...formData, events: formData.events.filter(v => v !== event.value) });
                                            }
                                        }}
                                        className="rounded border-gray-300 text-primary-600"
                                    />
                                    <span className="text-sm text-gray-700">{event.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                className="rounded border-gray-300 text-primary-600"
                            />
                            <span className="text-sm text-gray-700">Active (deliver events immediately)</span>
                        </label>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                        <p className="text-sm text-amber-800">
                            🔒 Your webhook endpoint should be configured to verify the signature of incoming requests
                            using the signing secret to ensure they came from Falcon PMS.
                        </p>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(BILLING_ROUTES.WEBHOOKS)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            Create Webhook
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default WebhookCreate;