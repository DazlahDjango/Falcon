import React, { useState, useEffect } from 'react';
import { settingsApi } from '../../../services/organisation';
import toast from 'react-hot-toast';

const IntegrationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [newApiKey, setNewApiKey] = useState({ name: '', permissions: ['read'] });
  const [newWebhook, setNewWebhook] = useState({ url: '', events: [], secret: '' });
  const [generatedKey, setGeneratedKey] = useState(null);

  useEffect(() => {
    fetchIntegrationData();
  }, []);

  const fetchIntegrationData = async () => {
    try {
      setLoading(true);
      const [apiRes, webhookRes] = await Promise.all([
        settingsApi.getApiKeys(),
        settingsApi.getWebhooks(),
      ]);
      setApiKeys(apiRes.data.results || apiRes.data || []);
      setWebhooks(webhookRes.data.results || webhookRes.data || []);
    } catch (error) {
      console.error('Error fetching integration data:', error);
      toast.error('Failed to load integration settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async () => {
    try {
      const response = await settingsApi.createApiKey(newApiKey);
      setGeneratedKey(response.data.key);
      toast.success('API key created successfully');
      setShowApiKeyModal(false);
      setNewApiKey({ name: '', permissions: ['read'] });
      fetchIntegrationData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create API key');
    }
  };

  const handleRevokeApiKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;
    try {
      await settingsApi.revokeApiKey(keyId);
      toast.success('API key revoked');
      fetchIntegrationData();
    } catch (error) {
      toast.error('Failed to revoke API key');
    }
  };

  const handleCreateWebhook = async () => {
    try {
      await settingsApi.createWebhook(newWebhook);
      toast.success('Webhook created successfully');
      setShowWebhookModal(false);
      setNewWebhook({ url: '', events: [], secret: '' });
      fetchIntegrationData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create webhook');
    }
  };

  const handleDeleteWebhook = async (webhookId) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await settingsApi.deleteWebhook(webhookId);
      toast.success('Webhook deleted');
      fetchIntegrationData();
    } catch (error) {
      toast.error('Failed to delete webhook');
    }
  };

  const handleTestWebhook = async (webhookId) => {
    try {
      await settingsApi.testWebhook(webhookId);
      toast.success('Test webhook sent successfully');
    } catch (error) {
      toast.error('Failed to send test webhook');
    }
  };

  const permissionOptions = [
    { value: 'read', label: 'Read Only' },
    { value: 'write', label: 'Read & Write' },
    { value: 'admin', label: 'Admin' },
  ];

  const eventOptions = [
    { value: 'organisation.updated', label: 'Organisation Updated' },
    { value: 'subscription.updated', label: 'Subscription Updated' },
    { value: 'payment.succeeded', label: 'Payment Succeeded' },
    { value: 'payment.failed', label: 'Payment Failed' },
    { value: 'user.created', label: 'User Created' },
    { value: 'user.updated', label: 'User Updated' },
    { value: 'kpi.submitted', label: 'KPI Submitted' },
    { value: 'kpi.approved', label: 'KPI Approved' },
    { value: 'kpi.rejected', label: 'KPI Rejected' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Integration Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage API keys and webhooks for external integrations
        </p>
      </div>

      <div className="space-y-6">
        {/* API Keys Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              + Create API Key
            </button>
          </div>
          <div className="p-6">
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                🔑 API keys allow external applications to access your organisation's data.
                Keep your keys secure and never share them publicly.
              </p>
            </div>

            {apiKeys.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No API keys created</p>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{key.name}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Last used: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="text-xs text-gray-500">{key.permissions.join(', ')}</span>
                      <button
                        onClick={() => handleRevokeApiKey(key.id)}
                        className="text-xs text-red-600 hover:text-red-900"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Webhooks Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Webhooks</h2>
            <button
              onClick={() => setShowWebhookModal(true)}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              + Add Webhook
            </button>
          </div>
          <div className="p-6">
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                🔗 Webhooks send real-time events to your specified URLs when events occur.
              </p>
            </div>

            {webhooks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No webhooks configured</p>
            ) : (
              <div className="space-y-3">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{webhook.url}</p>
                        <p className="text-xs text-gray-500">
                          Events: {webhook.events.join(', ')}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleTestWebhook(webhook.id)}
                          className="text-xs text-indigo-600 hover:text-indigo-900"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          className="text-xs text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500 font-mono">
                      Secret: {webhook.secret}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create API Key</h2>
              <button onClick={() => setShowApiKeyModal(false)} className="text-gray-400 hover:text-gray-500 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Key Name</label>
                <input
                  type="text"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Production API Key"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Permissions</label>
                <select
                  multiple
                  value={newApiKey.permissions}
                  onChange={(e) => setNewApiKey({ ...newApiKey, permissions: Array.from(e.target.selectedOptions, o => o.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {permissionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowApiKeyModal(false)} className="px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
              <button onClick={handleCreateApiKey} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Display Generated API Key Modal */}
      {generatedKey && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">API Key Generated</h2>
            <div className="bg-yellow-50 p-3 rounded-md mb-4">
              <p className="text-sm text-yellow-800 mb-2">⚠️ Copy your API key now. You won't be able to see it again!</p>
              <code className="block bg-gray-900 text-green-400 p-2 rounded text-sm font-mono break-all">{generatedKey}</code>
            </div>
            <button onClick={() => setGeneratedKey(null)} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md">I've copied my key</button>
          </div>
        </div>
      )}

      {/* Create Webhook Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add Webhook</h2>
              <button onClick={() => setShowWebhookModal(false)} className="text-gray-400 hover:text-gray-500 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Endpoint URL</label>
                <input
                  type="url"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://your-server.com/webhook"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Events</label>
                <select
                  multiple
                  value={newWebhook.events}
                  onChange={(e) => setNewWebhook({ ...newWebhook, events: Array.from(e.target.selectedOptions, o => o.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  size={8}
                >
                  {eventOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple events</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Secret (Optional)</label>
                <input
                  type="text"
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your webhook secret for verification"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button onClick={() => setShowWebhookModal(false)} className="px-4 py-2 border border-gray-300 rounded-md">Cancel</button>
              <button onClick={handleCreateWebhook} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Add Webhook</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationSettings;